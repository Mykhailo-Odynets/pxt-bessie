namespace Calibration {
    const WHEEL_DIAMETER_KEY = "WHEEL_DIAMETER"
    const CAR_DIAMETER_KEY = "CAR_DIAMETER"

    // mm
    const DEFAULT_WHEEL = 65;
    const DEFAULT_CAR = 140;

    export function setWheelDiameter(value: number) : void {
        settings.writeNumber(WHEEL_DIAMETER_KEY, value);
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
}