namespace StepperCar {
    export enum Motors {
        M1,
        M2,
        Both
    }

    export function MotorStart(motor: Motors, direction: boolean) : void {
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

    // distance - in centimeters
    // diameter - in milimeters
    export function CarMove(distance: number, diameter: number) : void {
        PCAmotor.StpCarMove(distance, diameter)
    }

    // degree - arc degree to rotate right
    // wD - wheel diameter
    // cD - car diameter (distance between wheels centers)
    export function CarRotate(degree: number, wD: number, cD: number) : void {
        const degreeToRotate = (degree * cD) / (2 * Math.PI * wD)

        PCAmotor.StepperDegree(PCAmotor.Steppers.STPM1, degreeToRotate)
        PCAmotor.StepperDegree(PCAmotor.Steppers.STPM2, -degreeToRotate)
    }
}