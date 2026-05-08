/**
 * Calibration tools for wheel and car dimensions
 */
//% color="#d2691e" icon="\uf0ad" weight=90
namespace Calibration {
    const WHEEL_DIAMETER_KEY = "WHEEL_DIAMETER"
    const CAR_DIAMETER_KEY = "CAR_DIAMETER"

    // For calibration
    const DISTANCE_MM = 1000;
    const STEPS_PER_REV = 4096;
    const STEPS_PER_SEC = 200;

    let startTime = 0;

    // mm
    const DEFAULT_WHEEL = 65;
    const DEFAULT_CAR = 125;

    /**
     * Manually set the wheel diameter in millimeters.
     * @param value diameter in mm (e.g., 65)
     */
    //% blockId=calib_set_wheel block="set wheel diameter to %value mm"
    //% weight=100
    export function setWheelDiameter(value: number) : void {
        settings.writeNumber(WHEEL_DIAMETER_KEY, value);
    }

    /**
     * Calculate and save wheel diameter based on a physically measured distance.
     * @param distMm the actual distance the car traveled in millimeters
     * @param rotations the number of full rotations the wheels made
     */
    //% blockId=calib_calc_wheel_dist block="calculate wheel diameter: distance %distMm mm | wheel rotations %rotations"
    //% weight=96 group="Manual Calibration"
    export function setWheelDiameterFromMeasuredDistance(distMm: number, rotations: number) {
        let circumference = distMm / rotations;
        let diameter = circumference / Math.PI;
        setWheelDiameter(diameter);
    }

    /**
     * Get the currently saved wheel diameter.
     */
    //% blockId=calib_get_wheel block="wheel diameter (mm)"
    //% weight=90
    export function getWheelDiameter(): number {
        return settings.readNumber(WHEEL_DIAMETER_KEY) || DEFAULT_WHEEL;
    }

    /**
     * Manually set the car diameter (distance between wheels).
     * @param value diameter in mm (e.g., 125)
     */
    //% blockId=calib_set_car block="set car diameter to %value mm"
    //% weight=80
    export function setCarDiameter(value: number) : void {
        settings.writeNumber(CAR_DIAMETER_KEY, value);
    }

    /**
     * Calculate and save car diameter by comparing wheel rotations to car body spins.
     * @param carRotations how many full 360° spins the car body made
     * @param wheelRotations how many full rotations the wheels made to achieve that
     */
    //% blockId=calib_calc_car_dist block="calculate car diameter: car spins %carRotations | wheel rotations %wheelRotations"
    //% weight=76 group="Manual Calibration"
    export function setCarDiameterFromWheelRotations(carRotations: number, wheelRotations: number) {
        if (carRotations <= 0) return;

        // Formula: Car Diameter = (Wheel Rotations * Wheel Diameter) / Car Rotations
        // We use the already saved wheel diameter for this calculation
        let carDiameter = (wheelRotations * getWheelDiameter()) / carRotations;

        setCarDiameter(carDiameter);
    }

    /**
     * Get the currently saved car diameter.
     */
    //% blockId=calib_get_car block="car diameter (mm)"
    //% weight=70
    export function getCarDiameter(): number {
        return settings.readNumber(CAR_DIAMETER_KEY) || DEFAULT_CAR;
    }

    /**
     * Reset all calibration settings to defaults.
     */
    //% blockId=calib_clear block="clear all calibration"
    //% weight=10
    export function clear(): void {
        settings.remove(WHEEL_DIAMETER_KEY);
        settings.remove(CAR_DIAMETER_KEY);
    }

    // --- WHEEL CALIBRATION (1 Meter Test) ---

    /**
     * Step 1: Start driving forward for wheel calibration.
     */
    //% blockId=calib_start_wheel block="start wheel calibration"
    //% group="Wheel Calibration" weight=60
    export function startWheelCalibration() {
        startTime = control.millis();

        StepperCar.MotorStart(StepperCar.Motors.Both)
    }

    /**
     * Step 2: Stop driving at exactly 1 meter to save wheel diameter.
     */
    //% blockId=calib_stop_wheel block="stop wheel calibration (at 1m)"
    //% group="Wheel Calibration" weight=50
    export function stopWheelCalibration() {
        if (startTime == 0) return;

        StepperCar.MotorStop(StepperCar.Motors.Both)

        let elapsed = (control.millis() - startTime) / 1000;
        startTime = 0;

        // Math: Steps -> Revolutions -> Circumference -> Diameter
        let totalSteps = elapsed * STEPS_PER_SEC;
        let revolutions = totalSteps / STEPS_PER_REV;

        if (revolutions > 0) {
            let circumference = DISTANCE_MM / revolutions;
            let diameter = circumference / Math.PI;

            setWheelDiameter(diameter);
        }
    }

    // --- CAR CALIBRATION (360 Degree Spin) ---

    /**
     * Step 1: Start spinning in place for car calibration.
     */
    //% blockId=calib_start_car block="start car calibration"
    //% group="Car Calibration" weight=40
    export function startCarCalibration() {
        startTime = control.millis();

        StepperCar.MotorStart(StepperCar.Motors.M1, true);
        StepperCar.MotorStart(StepperCar.Motors.M2, false);
    }

    /**
     * Step 2: Stop spinning after exactly one full 360 degree turn.
     */
    //% blockId=calib_stop_car block="stop car calibration (at 360°)"
    //% group="Car Calibration" weight=30
    export function stopCarCalibration() {
        if (startTime == 0) return;

        StepperCar.MotorStop(StepperCar.Motors.Both);

        let elapsed = (control.millis() - startTime) / 1000;
        startTime = 0;

        // Calculate how many times the wheel turned during that car spin
        let totalSteps = elapsed * STEPS_PER_SEC;
        let wheelRevolutions = totalSteps / STEPS_PER_REV;

        if (wheelRevolutions > 0) {
            // Formula: Car Diameter = Wheel Revolutions * Wheel Diameter
            let carDiameter = wheelRevolutions * getWheelDiameter();

            setCarDiameter(carDiameter);
        }
    }
}