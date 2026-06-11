namespace StepperCar {
    const PCA9685_ADDR = 0x40;
    const MODE1_REG = 0x00;
    const PRESCALE_REG = 0xfe;

    const FREQUENCY_KEY = "FREQUENCY";
    const DEFAULT_FREQUENCY = 50;

    function i2cwriteReg(reg: number, value: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(PCA9685_ADDR, buf);
    }

    function i2creadReg(reg: number): number {
        pins.i2cWriteNumber(PCA9685_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(PCA9685_ADDR, NumberFormat.UInt8BE);
    }

    /**
     * Changes the hardware frequency of the motors (the default is 50 Hz).
     * Increasing this value will make the stepper motors run faster.
     * @param freq The target frequency in Hz (between 0 and 100), eg: 100
     */
    //% blockId=set_motor_freq block="set motor frequency to $freq Hz"
    //% advanced=true weight=100
    export function setFrequency(freq: number) {
        settings.writeNumber(FREQUENCY_KEY, freq);

        let prescaleval = 25000000 / 4096 / freq - 1;
        let prescale = Math.floor(prescaleval + 0.5);

        let oldmode = i2creadReg(MODE1_REG);
        let newmode = (oldmode & 0x7f) | 0x10;

        i2cwriteReg(MODE1_REG, newmode);
        i2cwriteReg(PRESCALE_REG, prescale);
        i2cwriteReg(MODE1_REG, oldmode);

        control.waitMicros(5000);

        i2cwriteReg(MODE1_REG, oldmode | 0xa1);
    }

    /**
     * Gets the currently set hardware frequency of the motors in Hz.
     * Returns the default frequency if it has not been modified.
     */
    //% blockId=get_motor_freq block="motor frequency"
    //% advanced=true weight=90
    export function getFrequency(): number {
        return settings.readNumber(FREQUENCY_KEY) || DEFAULT_FREQUENCY;
    }
}
