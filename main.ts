namespace StepperCar {
    export enum Motors {
        M1, // Motor 1 na desce, pravý motor
        M2, // Motor 2 na desce, levý motor
        Both // Oba najednou
    }

    // direction - is forward, default true
    export function MotorStart(motor: Motors, direction: boolean = true) : void {
        if (motor === Motors.M1 || motor === Motors.Both) {
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM2, !direction);
        }
        if (motor === Motors.M2 || motor === Motors.Both) {
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM1, direction);
        }
    }

    export function MotorStop(motor: Motors) : void {
        if (motor === Motors.M1 || motor === Motors.Both) {
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM2);
        }
        if (motor === Motors.M2 || motor === Motors.Both) {
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM1);
        }
    }

    export function MotorRotate(motor: Motors, degree: number): void {
        if (motor === Motors.Both) return;

        if (motor === Motors.M1) {
            PCAmotor.StepperDegree(PCAmotor.Steppers.STPM2, -degree);
        }
        if (motor === Motors.M2) {
            PCAmotor.StepperDegree(PCAmotor.Steppers.STPM1, degree);
        }
        
        // Doesn't turn off automatically
        MotorStop(motor);
    }

    // distance - in centimeters
    // diameter - in milimeters
    export function CarMove(distance: number, diameter?: number) : void {
        // Issue: wrong motor direction, calculates distance based on delay
        // PCAmotor.StpCarMove(distance, diameter ? diameter : Calibration.getWheelDiameter());

        // Fixed logic from original
        // let delay = 10240 * 10 * distance / Math.PI / (diameter ? diameter : Calibration.getWheelDiameter());
        // MotorStart(Motors.Both, delay > 0); // This part
        // delay = Math.abs(delay);
        // basic.pause(delay);
        // MotorStop(Motors.Both);

        const circumference = Math.PI * (diameter ? diameter : Calibration.getWheelDiameter());
        const degreeToRotate = (distance * 10 / circumference) * 360;

        CarRotate(degreeToRotate, true)
    }

    // degree - arc degree to rotate
    // isForward - true (drives forward), false (default, rotates right)
    export function CarRotate(degree: number, isForward = false) : void {
        const degreeToRotate = isForward ? -degree : degree * Calibration.getCarDiameter() / Calibration.getWheelDiameter();

        // Starts the first motor in the background
        control.inBackground(() => {
            MotorRotate(Motors.M1, isForward ? degreeToRotate : -degreeToRotate)
        });

        MotorRotate(Motors.M2, degreeToRotate)

        MotorStop(Motors.Both);
    }
}