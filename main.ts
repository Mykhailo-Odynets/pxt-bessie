/**
 * Knihovna pro ovládání krokového motoru (např. 28BYJ-48)
 */
//% color="#2754A5" icon="\uf085" block="Krokový Motor"
namespace StepperMotor {
    export enum Modes {
        FullStep = 2048,
        HalfStep = 4096
    }

    let stepPhase: number = 0;

    // Klíč pro uložení do paměti micro:bitu
    const SETTING_WHEEL_SIZE = "wheel_size";
    const MOTOR_MODE = "motor_mode";

    /**
     * Interní funkce pro vykonání jednoho kroku
     */
    function doStep(pA: DigitalPin, pB: DigitalPin, pC: DigitalPin, pD: DigitalPin, direction: number): void {
        stepPhase += direction;
        if (stepPhase > 3) stepPhase = 0;
        if (stepPhase < 0) stepPhase = 3;

        pins.digitalWritePin(pA, (stepPhase == 0) ? 1 : 0);
        pins.digitalWritePin(pB, (stepPhase == 1) ? 1 : 0);
        pins.digitalWritePin(pC, (stepPhase == 2) ? 1 : 0);
        pins.digitalWritePin(pD, (stepPhase == 3) ? 1 : 0);
    }

    /**
     * Získá aktuálně uložený průměr kola (výchozí 30)
     */
    function getWheelDiameter(): number {
        let saved = settings.readNumber(SETTING_WHEEL_SIZE);
        if (saved == 0) return 30; // Pokud není uloženo nic, vrátíme 30
        return saved;
    }
    /**
     * Získá aktuálně uložený režim motoru (výchozí Full Step)
     */
    function getMotorMode(): number {
        let saved = settings.readNumber(MOTOR_MODE);
        if (saved == 0) return Modes.FullStep; // Pokud není uloženo nic, vrátíme Full Step
        return saved;
    }

    /**
     * Otočí motorem o zadaný počet stupňů.
     * @param deg počet stupňů (např. 90, 360, -180 pro zpětný chod)
     */
    //% block="otoč o %deg stupňů | piny A:%pA B:%pB C:%pC D:%pD | rychlost (prodleva) %delay ms"
    //% deg.shadow="arcBall"
    //% delay.defl=5
    export function rotateDegrees(deg: number, pA: DigitalPin, pB: DigitalPin, pC: DigitalPin, pD: DigitalPin, delay: number): void {
        let stepsToRun = Math.abs((deg / 360) * getMotorMode());
        let direction = deg > 0 ? 1 : -1;

        for (let i = 0; i < stepsToRun; i++) {
            doStep(pA, pB, pC, pD, direction);
            control.waitMicros(delay * 1000);
        }
        // Vypnutí pinů po dokončení (šetří energii a motor se nehřeje)
        release(pA, pB, pC, pD);
    }

    /**
     * Ujede zadanou vzdálenost v milimetrech.
     * @param mm kolik milimetrů má robot ujet
     * @param delay určuje rychlost otáčení
     */
    //% block="ujeď %mm mm | piny A:%pA B:%pB C:%pC D:%pD | rychlost %delay ms"
    //% mm.defl=100 wheelDiameter.defl=65 delay.defl=5
    export function moveDistance(mm: number, delay: number, pA: DigitalPin, pB: DigitalPin, pC: DigitalPin, pD: DigitalPin): void {
        let circumference = getWheelDiameter() * Math.PI; // Obvod kola
        let revolutions = mm / circumference;       // Kolik otoček je potřeba
        let stepsToRun = Math.abs(revolutions * getMotorMode());
        let direction = mm > 0 ? 1 : -1;

        for (let i = 0; i < stepsToRun; i++) {
            doStep(pA, pB, pC, pD, direction);
            control.waitMicros(delay * 1000);
        }
        release(pA, pB, pC, pD);
    }

    /**
     * Kalibrační funkce: Vypočítá nový průměr kola a uloží ho.
     * @param targetMm kolik robot MĚL ujet (např. 200)
     * @param actualMm kolik robot SKUTEČNĚ ujel (změřeno pravítkem)
     */
    //% block="kalibruj: cíl byl %targetMm mm, skutečnost %actualMm mm"
    //% targetMm.defl=200 actualMm.defl=200
    export function calibrate(targetMm: number, actualMm: number): void {
        if (actualMm <= 0) return;

        let currentDiameter = getWheelDiameter();
        // Matematika: Nový_průměr = Starý_průměr * (Skutečná_vzdálenost / Cílová_vzdálenost)
        let newDiameter = currentDiameter * (actualMm / targetMm);

        settings.writeNumber(SETTING_WHEEL_SIZE, newDiameter);
    }

    /**
     * Uloží nový průměr kola.
     * @param diameter průměr kola
     */
    //% block="nastav průměr %diameter mm"
    //% diameter.defl=30
    export function setWheelSize(diameter: number): void {
        if (diameter <= 0) return;

        settings.writeNumber(SETTING_WHEEL_SIZE, diameter);
    }

    /**
     * Uloží nový režim motoru.
     * @param mode režim motoru
     */
    export function setMotorMode(mode: Modes): void {
        settings.writeNumber(MOTOR_MODE, mode);
    }

    /**
     * Vypne proud do motoru (piny na 0)
     */
    //% block="uvolni motor na pinech A:%pA B:%pB C:%pC D:%pD"
    export function release(pA: DigitalPin, pB: DigitalPin, pC: DigitalPin, pD: DigitalPin): void {
        pins.digitalWritePin(pA, 0);
        pins.digitalWritePin(pB, 0);
        pins.digitalWritePin(pC, 0);
        pins.digitalWritePin(pD, 0);
    }
}