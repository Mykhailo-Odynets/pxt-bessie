// tests go here; this will not be compiled when this package is used as an extension.




StepperCar.MotorStart(StepperCar.Motors.M1, true)
basic.pause(5000)
StepperCar.MotorStop(StepperCar.Motors.M1)
StepperCar.MotorStart(StepperCar.Motors.M2, true)
basic.pause(5000)
StepperCar.MotorStop(StepperCar.Motors.M2)

StepperCar.CarMove(5)
StepperCar.CarRotate(90)