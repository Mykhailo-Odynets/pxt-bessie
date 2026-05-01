namespace StepperMotorPlus {
    const ADDRESS = 0x40
    const MODE1 = 0x00
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06

    const STEPS_PER_REV = 4096
    let _rpmDelay = 2
    let _initialized = false

    // State tracking for the 8-step sequence
    let _phase1 = 0
    let _phase2 = 0

    export enum Steppers {
        //% block="Stepper 1"
        STP1 = 1,
        //% block="Stepper 2"
        STP2 = 2,
        //% block="Both"
        Both = 3
    }

    // Half-step sequence (smoother and higher torque for 28BYJ-48)
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
        i2cWrite(MODE1, 0x00)
        // Set frequency to 50Hz (Standard for PCA9685)
        let prescale = Math.floor(25000000 / (4096 * 50) - 1)
        let oldmode = pins.i2cReadNumber(ADDRESS, NumberFormat.UInt8BE)
        i2cWrite(MODE1, (oldmode & 0x7F) | 0x10) // sleep
        i2cWrite(PRESCALE, prescale)
        i2cWrite(MODE1, oldmode)
        control.waitMicros(5000)
        i2cWrite(MODE1, oldmode | 0xa1)
        _initialized = true
    }

    /**
     * Internal function to move a motor by one physical step in the sequence
     */
    function doStep(motor: number, dir: number) {
        let phase = 0
        let startPin = (motor == 1) ? 0 : 4 // STP1 uses 0-3, STP2 uses 4-7

        // Update global phase tracking
        if (motor == 1) {
            _phase1 = (_phase1 + dir + 8) % 8
            phase = _phase1
        } else {
            _phase2 = (_phase2 + dir + 8) % 8
            phase = _phase2
        }

        let pinsArr = stepSeq[phase]
        for (let i = 0; i < 4; i++) {
            setPwm(startPin + i, 0, pinsArr[i] ? 4095 : 0)
        }
    }

    /**
     * Set speed in RPM (1-15 recommended)
     */
    //% block="set %motor speed to %rpm RPM"
    export function setSpeed(rpm: number) {
        // (60000ms / (RPM * 4096 steps))
        _rpmDelay = Math.max(1, 60000 / (rpm * STEPS_PER_REV))
    }

    /**
     * Rotate motor(s) by degrees
     */
    //% block="rotate %motor %degrees degrees"
    export function rotateDegrees(motor: Steppers, degrees: number) {
        init()
        let steps = Math.abs((degrees / 360) * STEPS_PER_REV)
        let dir = degrees > 0 ? 1 : -1

        for (let i = 0; i < steps; i++) {
            if (motor == Steppers.STP1 || motor == Steppers.Both) {
                doStep(1, dir)
            }
            if (motor == Steppers.STP2 || motor == Steppers.Both) {
                doStep(2, dir)
            }
            // Using waitMicros for higher precision speed at low delays
            control.waitMicros(_rpmDelay * 1000)
        }
    }

    /**
     * Travel distance in cm
     */
    //% block="move %motor %cm cm | wheel diameter %wheelDiam cm"
    export function travelDistance(motor: Steppers, cm: number, wheelDiam: number) {
        let circumference = Math.PI * wheelDiam
        let degrees = (cm / circumference) * 360
        rotateDegrees(motor, degrees)
    }

    /**
     * Stop and kill power to motors (prevents heat)
     */
    //% block="stop all motors"
    export function stopAll() {
        init()
        for (let i = 0; i < 16; i++) {
            setPwm(i, 0, 0)
        }
    }
}