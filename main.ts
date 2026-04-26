/**
 * Knihovna pro ovládání krokového motoru (např. 28BYJ-48)
 */
//% color="#2754A5" icon="\uf085" block="Krokový Motor"
namespace StepperMotor {

    // Konstanty pro motor 28BYJ-48 v režimu Full Step
    const STEPS_PER_REV = 2048;
    let stepPhase = 0;

    // Klíč pro uložení do paměti micro:bitu
    const SETTING_WHEEL_SIZE = "w_size";

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
     * Otočí motorem o zadaný počet stupňů.
     * @param deg počet stupňů (např. 90, 360, -180 pro zpětný chod)
     */
    //% block="otoč o %deg stupňů | piny A:%pA B:%pB C:%pC D:%pD | rychlost (prodleva) %delay ms"
    //% deg.shadow="arcBall"
    //% delay.defl=5
    export function rotateDegrees(deg: number, pA: DigitalPin, pB: DigitalPin, pC: DigitalPin, pD: DigitalPin, delay: number): void {
        let stepsToRun = Math.abs((deg / 360) * STEPS_PER_REV);
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
     * @param wheelDiameter průměr kola v milimetrech
     */
    //% block="ujeď %mm mm | s kolem o průměru %wheelDiameter mm | piny A:%pA B:%pB C:%pC D:%pD | rychlost %delay ms"
    //% mm.defl=100 wheelDiameter.defl=65 delay.defl=5
    export function moveDistance(mm: number, pA: DigitalPin, pB: DigitalPin, pC: DigitalPin, pD: DigitalPin, delay: number): void {
        let circumference = getWheelDiameter() * Math.PI; // Obvod kola
        let revolutions = mm / circumference;       // Kolik otoček je potřeba
        let stepsToRun = Math.abs(revolutions * STEPS_PER_REV);
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