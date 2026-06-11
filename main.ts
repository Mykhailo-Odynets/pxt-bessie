/**
 * Blocks for controlling a Stepper Motor Car
 */
//% color="#228b22" icon="\uf1b9" weight=100
namespace StepperCar {
    export enum Motors {
        //% block="left (M1)"
        M1,
        //% block="right (M2)"
        M2,
        //% block="both"
        Both,
    }

    /**
     * Starts the motor spinning continuously.
     * @param motor choose which motor to start
     * @param direction true for forward, false for backward
     */
    //% blockId=stepper_start block="start motor %motor | direction forward %direction"
    //% direction.shadow="toggleOnOff"
    //% weight=90
    export function MotorStart(motor: Motors, direction: boolean = true): void {
        if (motor === Motors.M1 || motor === Motors.Both) {
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM1, direction);
        }
        if (motor === Motors.M2 || motor === Motors.Both) {
            PCAmotor.StepperStart(PCAmotor.Steppers.STPM2, direction);
        }
    }

    /**
     * Stops the specified motor(s).
     * @param motor choose which motor to stop
     */
    //% blockId=stepper_stop block="stop motor %motor"
    //% weight=80
    export function MotorStop(motor: Motors): void {
        if (motor === Motors.M1 || motor === Motors.Both) {
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM1);
        }
        if (motor === Motors.M2 || motor === Motors.Both) {
            PCAmotor.StepperStop(PCAmotor.Steppers.STPM2);
        }
    }

    /**
     * Rotates a single motor by a specific number of degrees.
     * @param motor motor to rotate (M1 or M2)
     * @param degree number of degrees to rotate
     */
    //% blockId=stepper_rotate_motor block="rotate motor %motor | by %degree degrees"
    //% weight=70
    export function MotorRotate(motor: Motors, degree: number): void {
        if (motor === Motors.Both) return;

        if (motor === Motors.M1) {
            PCAmotor.StepperDegree(PCAmotor.Steppers.STPM1, degree);
        }
        if (motor === Motors.M2) {
            PCAmotor.StepperDegree(PCAmotor.Steppers.STPM2, degree);
        }

        // Doesn't turn off automatically
        MotorStop(motor);
    }

    /**
     * Moves the car forward or backward by a specific distance in centimeters.
     * @param distance distance in cm (positive for forward, negative for backward)
     * @param diameter optional wheel diameter in mm (uses calibrated value if empty)
     */
    //% blockId=stepper_car_move block="car move %distance cm || wheel diameter %diameter mm"
    //% expandableArgumentMode="toggle"
    //% weight=100
    export function CarMove(distance: number, diameter?: number): void {
        const circumference = Math.PI * (diameter ? diameter : StepperCar.getWheelDiameter());
        const degreeToRotate = ((distance * 10) / circumference) * 360;

        CarRotate(degreeToRotate, false);
    }

    /**
     * Rotates the car in place by a specific degree.
     * @param degree degrees to turn the car (positive for right, negative for left)
     * @param spinInPlace internal use: if false, moves both wheels same direction
     */
    //% blockId=stepper_car_rotate block="car rotate %degree degrees"
    //% spinInPlace.defl=false
    //% spinInPlace.hidden=true
    //% weight=95
    export function CarRotate(degree: number, spinInPlace = true): void {
        const degreeToRotate = spinInPlace
            ? (degree * StepperCar.getCarDiameter()) / StepperCar.getWheelDiameter()
            : degree;

        const m1Direction = spinInPlace ? -1 : 1;

        let isBgMotorFinished = false;

        // Starts the first motor in the background
        control.inBackground(() => {
            MotorRotate(Motors.M2, degreeToRotate * m1Direction);
            isBgMotorFinished = true;
        });

        MotorRotate(Motors.M1, degreeToRotate);

        while (!isBgMotorFinished) {
            basic.pause(1);
        }
    }
}
