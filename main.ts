namespace StepperCar {
    export enum Motors {
        M1,
        M2,
        Both
    }

    // direction - is forward, default true
    export function MotorStart(motor: Motors, direction: boolean = true) : void {
        if (motor == Motors.M1 || motor == Motors.Both) {
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM1, direction);
        }
        if (motor == Motors.M2 || motor == Motors.Both) {
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM2, direction);
        }
    }

    export function MotorStop(motor: Motors) : void {
        if (motor == Motors.M1 || motor == Motors.Both) {
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM1);
        }
        if (motor == Motors.M2 || motor == Motors.Both) {
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM2);
        }
    }

    export function MotorRotate(motor: Motors, degree: number): void {
        if (motor == Motors.M1 || motor == Motors.Both) {
            PCAmotor.StepperDegree(PCAmotor.Steppers.STPM1, degree);
        }
        if (motor == Motors.M2 || motor == Motors.Both) {
            PCAmotor.StepperDegree(PCAmotor.Steppers.STPM2, degree)
        }
    }

    // distance - in centimeters
    // diameter - in milimeters
    export function CarMove(distance: number, diameter?: number) : void {
        PCAmotor.StpCarMove(distance, diameter ? diameter : Calibration.getWheelDiameter())
    }

    // degree - arc degree to rotate right
    // wD - wheel diameter
    // cD - car diameter (distance between wheels centers)
    export function CarRotate(degree: number, wD?: number, cD?: number) : void {
        wD = wD ? wD : Calibration.getWheelDiameter()
        cD = cD ? cD : Calibration.getCarDiameter()

        const degreeToRotate = (degree * cD) / (2 * Math.PI * wD)

        PCAmotor.StepperDegree(PCAmotor.Steppers.STPM1, degreeToRotate)
        PCAmotor.StepperDegree(PCAmotor.Steppers.STPM2, -degreeToRotate)
    }
}