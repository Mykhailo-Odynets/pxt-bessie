namespace StepperMotorPlus {
    let _rpmDelay = 5
    const STEPS_PER_REV = 4096

    export enum Steppers {
        STP1 = PCAmotor.Steppers.STPM1,
        STP2 = PCAmotor.Steppers.STPM2,
        Both
    }

    /**
     * Set speed in RPM (1-15 recommended)
     */
    //% block="set %motor speed to %rpm RPM"
    export function setSpeed(rpm: number) {
        _rpmDelay = Math.max(1, (60000 / (rpm * STEPS_PER_REV)) * 8)
    }

    /**
     * Rotate motor(s) by degrees
     */
    //% block="rotate %motor %degrees degrees"
    export function rotateDegrees(motor: Steppers, degrees: number) {
        let stepsNeeded = Math.abs((degrees / 360) * STEPS_PER_REV) / 8

        for (let i = 0; i < stepsNeeded; i++) {
            if (motor == Steppers.STP1 || motor == Steppers.Both) {
                PCAmotor.StepperDegree(PCAmotor.Steppers.STPM1, 2) // Moving in 2-degree increments for stability
            }
            if (motor == Steppers.STP2 || motor == Steppers.Both) {
                PCAmotor.StepperDegree(PCAmotor.Steppers.STPM2, 2)
            }
            basic.pause(_rpmDelay)
        }
    }

    /**
     * Travel distance in cm
     */
    //% block="move %motor %cm cm | wheel diameter %wheelDiam cm"
    export function travelDistance(motor: Steppers, cm: number, wheelDiam: number) {
        let circumference = 3.14159 * wheelDiam
        let degrees = (cm / circumference) * 360
        rotateDegrees(motor, degrees)
    }

    /**
     * Stop all motors (cuts power to save battery/heat)
     */
    //% block="stop all motors"
    export function stopAll() {
        PCAmotor.StepperStop(PCAmotor.Steppers.STPM1)
        PCAmotor.StepperStop(PCAmotor.Steppers.STPM2)
    }
}