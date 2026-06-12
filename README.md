# StepperCar MakeCode Extension 🚗

A Microsoft MakeCode extension for precise control of a Stepper Motor Car using the PCA9685 driver. This extension provides easy-to-use blocks for vehicle movement, individual motor control, speed adjustments, and dimension calibration for accurate driving.

---

## 🚀 Use as Extension

To use this extension in your MakeCode project:

1. Open **MakeCode for micro:bit**
2. Create a **New Project**
3. Open **Extensions** from the settings menu (⚙️)
4. Search for and import:

```
https://github.com/Mykhailo-Odynets/pxt-bessie
```

---

## 🛠️ Blocks Overview

### 1. Car Movement

Control the overall movement of the vehicle using calculated distances and rotation angles.

#### Car Move

Moves the car forward or backward by a specified distance in centimeters.

#### Car Rotate

Rotates the car in place by a specified angle in degrees.

- Positive values → rotate right
- Negative values → rotate left

**Example:**

```typescript
// Move forward 10 cm, then rotate right 90 degrees
StepperCar.CarMove(10)
StepperCar.CarRotate(90)
```

---

### 2. Direct Motor Control

For advanced control, you can operate the left (`M1`) and right (`M2`) stepper motors individually.

#### Start Motor

Starts the selected motor spinning continuously.

#### Stop Motor

Stops the selected motor.

#### Rotate Motor

Rotates a single motor by a specified number of degrees.

**Example:**

```typescript
StepperCar.MotorStart(StepperCar.Motors.Both, true)
basic.pause(1000)
StepperCar.MotorStop(StepperCar.Motors.Both)

StepperCar.MotorRotate(StepperCar.Motors.M1, 360)
```

---

## ⚙️ Calibration

To ensure that `CarMove()` and `CarRotate()` are as accurate as possible, the extension uses the physical dimensions of your vehicle:

- Wheel Diameter
- Car Diameter (distance between wheels)

### Manual Calibration

If you know the exact dimensions of your car, you can set them directly.

Default values:

- Wheel Diameter: **65 mm**
- Car Diameter: **125 mm**

**Example:**

```typescript
StepperCar.setWheelDiameter(65)
StepperCar.setCarDiameter(125)
```

---

### Live Calibration Tests

The extension also provides built-in calibration procedures.

#### Wheel Calibration (1 Meter Test)

1. Start calibration.
2. Let the car drive forward.
3. Measure the actual traveled distance.
4. Stop calibration and provide the measured distance in millimeters.

#### Car Calibration (360° Rotation Test)

1. Start rotation calibration.
2. Let the car rotate.
3. Stop the calibration once the car completes exactly one full revolution.

**Example:**

```typescript
input.onButtonPressed(Button.A, function () {
    StepperCar.startWheelCalibration()
})

input.onButtonPressed(Button.B, function () {
    StepperCar.stopWheelCalibration(1000)
})
```

---

## ⚡ Speed & Hardware Settings

Motor speed can be adjusted by changing the PCA9685 PWM frequency.

Default frequency:

```text
50 Hz
```

Increasing the frequency will make the stepper motors run faster.

### ⚠️ Warning

Do **not** change the frequency if standard RC servos are connected to the same PCA9685 board.

Using frequencies other than 50 Hz may cause standard servos to overheat or become damaged.

**Example:**

```typescript
// Set frequency to 100 Hz for faster stepper movement
StepperCar.setFrequency(100)
```
