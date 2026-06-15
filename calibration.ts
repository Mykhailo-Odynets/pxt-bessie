/**
 * Calibration tools for wheel and car dimensions
 */
namespace StepperCar {
    const WHEEL_DIAMETER_KEY = "WHEEL_DIAMETER";
    const CAR_DIAMETER_KEY = "CAR_DIAMETER";

    // For calibration
    const STEPS_PER_REV = 2048;

    let startTime = 0;

    // mm
    const DEFAULT_WHEEL = 65;
    const DEFAULT_CAR = 125;

    /**
     * Manually set the wheel diameter in millimeters.
     * @param value diameter in mm (e.g., 65)
     */
    //% blockId=calib_set_wheel block="set wheel diameter to %value mm"
    //% group="Calibration" weight=100
    export function setWheelDiameter(value: number): void {
        settings.writeNumber(WHEEL_DIAMETER_KEY, value);
    }

    /**
     * Get the currently saved wheel diameter.
     */
    //% blockId=calib_get_wheel block="wheel diameter (mm)"
    //% blockHidden=true
    //% weight=90
    export function getWheelDiameter(): number {
        return settings.readNumber(WHEEL_DIAMETER_KEY) || DEFAULT_WHEEL;
    }

    /**
     * Manually set the car diameter (distance between wheels).
     * @param value diameter in mm (e.g., 125)
     */
    //% blockId=calib_set_car block="set car diameter to %value mm"
    //% group="Calibration" weight=80
    export function setCarDiameter(value: number): void {
        settings.writeNumber(CAR_DIAMETER_KEY, value);
    }

    /**
     * Get the currently saved car diameter.
     */
    //% blockId=calib_get_car block="car diameter (mm)"
    //% blockHidden=true
    //% weight=70
    export function getCarDiameter(): number {
        return settings.readNumber(CAR_DIAMETER_KEY) || DEFAULT_CAR;
    }

    /**
     * Reset all calibration settings to defaults.
     */
    //% blockId=calib_clear block="clear all calibration"
    //% advanced=true weight=10
    //% group="Other"
    export function clearCalibration(): void {
        settings.remove(WHEEL_DIAMETER_KEY);
        settings.remove(CAR_DIAMETER_KEY);
    }

    // --- WHEEL CALIBRATION (1 Meter Test) ---

    /**
     * Step 1: Start driving forward for wheel calibration.
     */
    //% blockId=calib_start_wheel block="start wheel calibration"
    //% group="Calibration" weight=60
    export function startWheelCalibration() {
        startTime = control.millis();

        MotorStart(Motors.Both);
    }

    /**
     * Step 2: Stop driving at the specified distance to calculate and save the wheel diameter.
     * @param distance The distance the car has driven in millimeters, eg: 1000
     */
    //% blockId=calib_stop_wheel block="stop wheel calibration at $distance mm"
    //% group="Calibration" weight=50
    export function stopWheelCalibration(distance: number = 1000) {
        if (startTime == 0) return;

        MotorStop(Motors.Both);

        let elapsed = (control.millis() - startTime) / 1000;
        startTime = 0;

        let stepsPerSec = getFrequency() * 4;

        // Math: Steps -> Revolutions -> Circumference -> Diameter
        let totalSteps = elapsed * stepsPerSec;
        let revolutions = totalSteps / STEPS_PER_REV;

        if (revolutions > 0) {
            let circumference = distance / revolutions;
            let diameter = circumference / Math.PI;

            setWheelDiameter(diameter);
        }
    }

    // --- CAR CALIBRATION (360 Degree Spin) ---

    /**
     * Step 1: Start spinning in place for car calibration.
     */
    //% blockId=calib_start_car block="start car calibration"
    //% group="Calibration" weight=40
    export function startCarCalibration() {
        startTime = control.millis();

        MotorStart(Motors.M1, true);
        MotorStart(Motors.M2, false);
    }

    /**
     * Step 2: Stop spinning after the specified angle to calculate and save the car diameter.
     * @param angle The angle the car just spun in degrees, eg: 360
     */
    //% blockId=calib_stop_car block="stop car calibration at $angle degrees"
    //% group="Calibration" weight=30
    export function stopCarCalibration(angle: number = 360) {
        if (startTime == 0) return;

        MotorStop(Motors.Both);

        let elapsed = (control.millis() - startTime) / 1000;
        startTime = 0;

        let stepsPerSec = getFrequency() * 4;

        // Calculate how many times the wheel turned during that car spin
        let totalSteps = elapsed * stepsPerSec;
        let wheelRevolutions = totalSteps / STEPS_PER_REV;

        if (wheelRevolutions > 0) {
            // Formula: Car Diameter = Wheel Revolutions * Wheel Diameter
            let carDiameter = (wheelRevolutions * getWheelDiameter()) * (360 / angle);

            setCarDiameter(carDiameter);
        }
    }
}
