/**
 * Custom I2C Stepper Library for 28BYJ-48
 * Based on PCA9685 I2C Driver (Address 0x40)
 */
//% color="#228b22" icon="\uf085" block="I2C Stepper"
namespace I2CStepper {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const LED0_ON_L = 0x06

    let _speedDelay = 2 // Default speed delay in ms
    const STEPS_PER_REV = 4096 // For 28BYJ-48 in Half-Step mode

    function i2cWrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function setPWM(channel: number, on: number, off: number) {
        i2cWrite(PCA9685_ADDRESS, LED0_ON_L + 4 * channel, on & 0xff)
        i2cWrite(PCA9685_ADDRESS, LED0_ON_L + 4 * channel + 1, (on >> 8) & 0xff)
        i2cWrite(PCA9685_ADDRESS, LED0_ON_L + 4 * channel + 2, off & 0xff)
        i2cWrite(PCA9685_ADDRESS, LED0_ON_L + 4 * channel + 3, (off >> 8) & 0xff)
    }

    // Half-step sequence for 28BYJ-48
    const stepSeq = [
        [1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0],
        [0, 0, 1, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 0, 0, 1]
    ]

    function doStep(step: number) {
        let s = stepSeq[step % 8]
        for (let i = 0; i < 4; i++) {
            setPWM(8 + i, 0, s[i] ? 4095 : 0) // Assumes pins 8,9,10,11 on PCA9685
        }
    }

    /**
     * Set motor speed (1-15 RPM recommended for 28BYJ-48)
     */
    //% block="set speed to %rpm RPM"
    export function setSpeed(rpm: number) {
        // Convert RPM to delay: 60,000ms / (RPM * 4096 steps)
        _speedDelay = Math.max(1, 60000 / (rpm * STEPS_PER_REV))
    }

    /**
     * Rotate the motor by a specific degree
     */
    //% block="rotate %degrees degrees"
    export function rotateDegrees(degrees: number) {
        let steps = Math.abs((degrees / 360) * STEPS_PER_REV)
        for (let i = 0; i < steps; i++) {
            doStep(i)
            basic.pause(_speedDelay)
        }
    }

    /**
     * Travel a specific distance in cm
     * @param cm distance to travel
     * @param wheelDiam diameter of the wheel in cm
     */
    //% block="travel %cm cm with wheel diameter %wheelDiam cm"
    export function travelDistance(cm: number, wheelDiam: number) {
        let circumference = Math.PI * wheelDiam
        let rotations = cm / circumference
        rotateDegrees(rotations * 360)
    }

    // Initialize PCA9685
    i2cWrite(PCA9685_ADDRESS, MODE1, 0x00)
}