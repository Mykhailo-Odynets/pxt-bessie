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
    const DEFAULT_CAR = 124;

    export function setWheelDiameter(value: number) : void {
        settings.writeNumber(WHEEL_DIAMETER_KEY, value);
    }
    export function setWheelDiameterFromMeasuredDistance(distMm: number, rotations: number) {
        let circumference = distMm / rotations;
        let diameter = circumference / Math.PI;
        setWheelDiameter(diameter);
    }
    export function getWheelDiameter(): number {
        return settings.readNumber(WHEEL_DIAMETER_KEY) || DEFAULT_WHEEL;
    }

    export function setCarDiameter(value: number) : void {
        settings.writeNumber(CAR_DIAMETER_KEY, value);
    }
    export function getCarDiameter(): number {
        return settings.readNumber(CAR_DIAMETER_KEY) || DEFAULT_CAR;
    }

    export function clear(): void {
        settings.remove(WHEEL_DIAMETER_KEY);
        settings.remove(CAR_DIAMETER_KEY);
    }

    /**
     * Call this when the remote "Start" button is pressed.
     */
    export function startWheelCalibration() {
        startTime = control.millis();

        StepperCar.MotorStart(StepperCar.Motors.Both)
    }

    /**
     * Call this when the remote "Stop" button is pressed at 1 meter.
     */
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
}