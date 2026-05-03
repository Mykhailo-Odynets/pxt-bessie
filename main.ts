/**
 * Final Optimized Stepper Library for 28BYJ-48 (I2C / PCA9685)
 * Features: Speed Control, Degree Rotation, Distance Travel, Sync Dual Motors
 */
//% color="#228b22" icon="\uf085" block="Stepper Plus"
namespace StepperMotorPlus {
    const ADDRESS = 0x40
    const MODE1 = 0x00
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06

    // 28BYJ-48 Half-Step Mode Constant
    const STEPS_PER_REV = 4096

    let _rpmDelay = 2000 // Microseconds between steps
    let _initialized = false
    let _phase1 = 0
    let _phase2 = 0

    export enum StepperList {
        //% block="Stepper 1"
        STP1 = 1,
        //% block="Stepper 2"
        STP2 = 2,
        //% block="Both"
        Both = 3
    }

    // Full-Step sequence for maximum speed
    const stepSeq = [
        [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0],
        [0, 0, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 0, 0, 1]
    ]

    function i2cWrite(reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(ADDRESS, buf)
    }

    function setPwm(channel: number, on: number, off: number): void {
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(ADDRESS, buf);
    }

    function init(): void {
        if (_initialized) return
        // pins.i2cSetFastMode(true) // Set I2C to 400kHz
        i2cWrite(MODE1, 0x00)
        let oldmode = pins.i2cReadNumber(ADDRESS, NumberFormat.UInt8BE)
        i2cWrite(MODE1, (oldmode & 0x7F) | 0x10) // sleep
        i2cWrite(PRESCALE, 121) // ~50Hz
        i2cWrite(MODE1, oldmode)
        control.waitMicros(5000)
        i2cWrite(MODE1, oldmode | 0xa1)
        _initialized = true
    }

    function doStep(motor: number, dir: number) {
        let startPin = (motor == 1) ? 0 : 4
        if (motor == 1) {
            _phase1 = (_phase1 + dir + 4) % 4
            let pinsArr = stepSeq[_phase1]
            for (let i = 0; i < 4; i++) setPwm(startPin + i, 0, pinsArr[i] ? 4095 : 0)
        } else {
            _phase2 = (_phase2 + dir + 4) % 4
            let pinsArr = stepSeq[_phase2]
            for (let i = 0; i < 4; i++) setPwm(startPin + i, 0, pinsArr[i] ? 4095 : 0)
        }
    }

    /**
     * Set motor speed in RPM. 
     * Note: 28BYJ-48 maxes out around 15-20 RPM.
     */
    //% block="set %motor speed to %rpm RPM"
    //% weight=100
    export function setSpeed(rpm: number) {
        // Convert RPM to microseconds: (60,000,000us / (RPM * 2048 steps))
        _rpmDelay = Math.max(500, 60000000 / (rpm * STEPS_PER_REV))
    }

    /**
     * Rotate motor(s) by a specific degree amount.
     */
    //% block="rotate %motor %degrees degrees"
    //% weight=90
    export function rotateDegrees(motor: StepperList, degrees: number) {
        init()
        let steps = Math.abs((degrees / 360) * STEPS_PER_REV)
        let dir = degrees > 0 ? 1 : -1

        for (let i = 0; i < steps; i++) {
            if (motor == StepperList.STP1 || motor == StepperList.Both) doStep(1, dir)
            if (motor == StepperList.STP2 || motor == StepperList.Both) doStep(2, dir)
            control.waitMicros(_rpmDelay)
        }
    }

    /**
     * Move motor(s) forward/backward by distance in centimeters.
     */
    //% block="move %motor %cm cm | wheel diameter %wheelDiam cm"
    //% weight=80
    export function travelDistance(motor: StepperList, cm: number, wheelDiam: number) {
        let circumference = Math.PI * wheelDiam
        let degrees = (cm / circumference) * 360
        rotateDegrees(motor, degrees)
    }

    /**
     * Cuts power to all stepper coils to save battery and prevent heat.
     */
    //% block="stop all motors"
    //% weight=70
    export function stopAll() {
        init()
        for (let i = 0; i < 16; i++) setPwm(i, 0, 0)
    }
}