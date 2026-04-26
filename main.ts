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
    export function moveDistance(mm: number, wheelDiameter: number, pA: DigitalPin, pB: DigitalPin, pC: DigitalPin, pD: DigitalPin, delay: number): void {
        let circumference = wheelDiameter * Math.PI; // Obvod kola
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