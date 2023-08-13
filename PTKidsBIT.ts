/**
 * Functions are mapped to blocks using various macros
 * in comments starting with %. The most important macro
 * is "block", and it specifies that a block should be
 * generated for an **exported** function.
 */

let Sensor_PIN: number[] = []
let Sensor_Left: number[] = []
let Sensor_Right: number[] = []
let Num_Sensor = 0
let LED_PIN = 0

let ADC_Version = 1
let Read_ADC_Version = false
let PCA = 0x40
let initI2C = false
let SERVOS = 0x06
let Color_Line: number[] = []
let Color_Background: number[] = []
let Color_Line_Left: number[] = []
let Color_Background_Left: number[] = []
let Color_Line_Right: number[] = []
let Color_Background_Right: number[] = []
let Line_Mode = 0
let Last_Position = 0
let error = 0
let P = 0
let D = 0
let previous_error = 0
let PD_Value = 0
let left_motor_speed = 0
let right_motor_speed = 0
let last_degree_P8 = 0;
let last_degree_P12 = 0;
let distance = 0
let timer = 0

enum Motor_Write {
    //% block="1"
    Motor_1,
    //% block="2"
    Motor_2
}

enum _Turn {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

enum _Spin {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

enum Servo_Write {
    //% block="P8"
    P8,
    //% block="P12"
    P12
}

enum Servo_Write2 {
    //% block="P8"
    P8,
    //% block="P12"
    P12,
    //% block="S0"
    S0,
    //% block="S1"
    S1,
    //% block="S2"
    S2,
    //% block="S3"
    S3,
    //% block="S4"
    S4,
    //% block="S5"
    S5,
    //% block="S6"
    S6,
    //% block="S7"
    S7
}

enum Servo_Mode {
    //% block="Release"
    Release,
    //% block="Lock"
    Lock
}

enum Button_Status {
    //% block="Pressed"
    Pressed,
    //% block="Released"
    Released
}

enum Button_Pin {
    //% block="P1"
    P1,
    //% block="P2"
    P2,
    //% block="P8"
    P8,
    //% block="P12"
    P12
}

enum Ultrasonic_PIN {
    //% block="P1"
    P1,
    //% block="P2"
    P2
}

enum ADC_Read {
    //% block="0"
    ADC0 = 0x84,
    //% block="1"
    ADC1 = 0xC4,
    //% block="2"
    ADC2 = 0x94,
    //% block="3"
    ADC3 = 0xD4,
    //% block="4"
    ADC4 = 0xA4,
    //% block="5"
    ADC5 = 0xE4,
    //% block="6"
    ADC6 = 0xB4,
    //% block="7"
    ADC7 = 0xF4
}

enum Forward_Direction {
    //% block="Forward"
    Forward,
    //% block="Backward"
    Backward
}

enum Find_Line {
    //% block="Left"
    Left,
    //% block="Center"
    Center,
    //% block="Right"
    Right
}

enum LED_Pin {
    //% block="Disable"
    Disable,
    //% block="P1"
    P1,
    //% block="P2"
    P2,
    //% block="P8"
    P8,
    //% block="P12"
    P12
}

enum Turn_Line {
    //% block="Left"
    Left,
    //% block="Right"
    Right
}

//% color="#51cb57" icon="\u2B9A"
namespace PTKidsBIT {
    function initPCA(): void {
        let i2cData = pins.createBuffer(2)
        initI2C = true
        i2cData[0] = 0
        i2cData[1] = 0x10
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = 0xFE
        i2cData[1] = 101
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = 0
        i2cData[1] = 0x81
        pins.i2cWriteBuffer(PCA, i2cData, false)

        for (let servo = 0; servo < 16; servo++) {
            i2cData[0] = SERVOS + servo * 4 + 0
            i2cData[1] = 0x00

            i2cData[0] = SERVOS + servo * 4 + 1
            i2cData[1] = 0x00
            pins.i2cWriteBuffer(PCA, i2cData, false);
        }
    }

    function setServoPCA(servo: number, angle: number): void {
        if (initI2C == false) {
            initPCA()
        }
        let i2cData = pins.createBuffer(2)
        let start = 0
        let angle_input = pins.map(angle, 0, 180, -90, 90)
        angle = Math.max(Math.min(90, angle_input), -90)
        let stop = 369 + angle * 235 / 90
        i2cData[0] = SERVOS + servo * 4 + 2
        i2cData[1] = (stop & 0xff)
        pins.i2cWriteBuffer(PCA, i2cData, false)

        i2cData[0] = SERVOS + servo * 4 + 3
        i2cData[1] = (stop >> 8)
        pins.i2cWriteBuffer(PCA, i2cData, false)
    }

    //% group="Motor Control"
    /**
     * Stop all Motor
     */
    //% block="Motor Stop"
    export function motorStop(): void {
        if (Read_ADC_Version == false) {
            let i2cData = pins.createBuffer(1)
            i2cData[0] = 132
            if (pins.i2cWriteBuffer(0x4b, i2cData, false) == 0) {
                ADC_Version = 2
            }
            else {
                ADC_Version = 1
            }
            Read_ADC_Version = true
        }

        if (ADC_Version == 1) {
            pins.digitalWritePin(DigitalPin.P13, 1)
            pins.analogWritePin(AnalogPin.P14, 0)
            pins.digitalWritePin(DigitalPin.P15, 1)
            pins.analogWritePin(AnalogPin.P16, 0)
        }
        else if (ADC_Version == 2) {
            pins.analogWritePin(AnalogPin.P13, 1023)
            pins.analogWritePin(AnalogPin.P14, 1023)
            pins.analogWritePin(AnalogPin.P15, 1023)
            pins.analogWritePin(AnalogPin.P16, 1023)
        }
    }

    //% group="Motor Control"
    /**
     * Spin the Robot to Left or Right. The speed motor is adjustable between 0 to 100.
     */
    //% block="Spin %_Spin|Speed %Speed"
    //% speed.min=0 speed.max=100
    export function Spin(spin: _Spin, speed: number): void {
        if (Read_ADC_Version == false) {
            let i2cData = pins.createBuffer(1)
            i2cData[0] = 132
            if (pins.i2cWriteBuffer(0x4b, i2cData, false) == 0) {
                ADC_Version = 2
            }
            else {
                ADC_Version = 1
            }
            Read_ADC_Version = true
        }

        if (ADC_Version == 1) {
            if (spin == _Spin.Left) {
                pins.digitalWritePin(DigitalPin.P13, 0)
                pins.analogWritePin(AnalogPin.P14, speed)
                pins.digitalWritePin(DigitalPin.P15, 1)
                pins.analogWritePin(AnalogPin.P16, speed)
            }
            else if (spin == _Spin.Right) {
                pins.digitalWritePin(DigitalPin.P13, 1)
                pins.analogWritePin(AnalogPin.P14, speed)
                pins.digitalWritePin(DigitalPin.P15, 0)
                pins.analogWritePin(AnalogPin.P16, speed)
            }
        }
        else if (ADC_Version == 2) {
            if (spin == _Spin.Left) {
                motorGo(-speed, speed)
            }
            else if (spin == _Spin.Right) {
                motorGo(speed, -speed)
            }
        }
    }

    //% group="Motor Control"
    /**
     * Turn the Robot to Left or Right. The speed motor is adjustable between 0 to 100.
     */
    //% block="Turn %_Turn|Speed %Speed"
    //% speed.min=0 speed.max=100
    export function Turn(turn: _Turn, speed: number): void {
        if (Read_ADC_Version == false) {
            let i2cData = pins.createBuffer(1)
            i2cData[0] = 132
            if (pins.i2cWriteBuffer(0x4b, i2cData, false) == 0) {
                ADC_Version = 2
            }
            else {
                ADC_Version = 1
            }
            Read_ADC_Version = true
        }
        if (ADC_Version == 1) {
            if (turn == _Turn.Left) {
                pins.digitalWritePin(DigitalPin.P13, 0)
                pins.analogWritePin(AnalogPin.P14, 0)
                pins.digitalWritePin(DigitalPin.P15, 1)
                pins.analogWritePin(AnalogPin.P16, speed)
            }
            else if (turn == _Turn.Right) {
                pins.digitalWritePin(DigitalPin.P13, 1)
                pins.analogWritePin(AnalogPin.P14, speed)
                pins.digitalWritePin(DigitalPin.P15, 0)
                pins.analogWritePin(AnalogPin.P16, 0)
            }
        }
        else if (ADC_Version == 2) {
            if (turn == _Turn.Left) {
                motorGo(0, speed)
            }
            else if (turn == _Turn.Right) {
                motorGo(speed, 0)
            }
        }
    }

    //% group="Motor Control"
    /**
     * Control motors speed both at the same time. The speed motors is adjustable between -100 to 100.
     */
    //% block="Motor1 %Motor1|Motor2 %Motor2"
    //% speed1.min=-100 speed1.max=100
    //% speed2.min=-100 speed2.max=100
    export function motorGo(speed1: number, speed2: number): void {
        if (Read_ADC_Version == false) {
            let i2cData = pins.createBuffer(1)
            i2cData[0] = 132
            if (pins.i2cWriteBuffer(0x4b, i2cData, false) == 0) {
                ADC_Version = 2
            }
            else {
                ADC_Version = 1
            }
            Read_ADC_Version = true
        }

        if (ADC_Version == 1) {
            speed1 = pins.map(speed1, -100, 100, -1023, 1023)
            speed2 = pins.map(speed2, -100, 100, -1023, 1023)

            if (speed1 < 0) {
                pins.digitalWritePin(DigitalPin.P13, 0)
                pins.analogWritePin(AnalogPin.P14, -speed1 + 2)
                pins.analogSetPeriod(AnalogPin.P14, 2000)
            }
            else if (speed1 >= 0) {
                pins.digitalWritePin(DigitalPin.P13, 1)
                pins.analogWritePin(AnalogPin.P14, speed1 - 2)
                pins.analogSetPeriod(AnalogPin.P14, 2000)
            }

            if (speed2 < 0) {
                pins.digitalWritePin(DigitalPin.P15, 0)
                pins.analogWritePin(AnalogPin.P16, -speed2)
                pins.analogSetPeriod(AnalogPin.P16, 2000)
            }
            else if (speed2 >= 0) {
                pins.digitalWritePin(DigitalPin.P15, 1)
                pins.analogWritePin(AnalogPin.P16, speed2)
                pins.analogSetPeriod(AnalogPin.P16, 2000)
            }
        }
        else if (ADC_Version == 2) {
            speed1 = pins.map(speed1, -100, 100, -1023, 1023)
            speed2 = pins.map(speed2, -100, 100, -1023, 1023)

            if (speed1 < 0) {
                pins.analogWritePin(AnalogPin.P13, 0)
                pins.analogWritePin(AnalogPin.P14, -speed1)
                pins.analogSetPeriod(AnalogPin.P13, 200)
                pins.analogSetPeriod(AnalogPin.P14, 200)
            }
            else if (speed1 >= 0) {
                pins.analogWritePin(AnalogPin.P14, 0)
                pins.analogWritePin(AnalogPin.P13, speed1)
                pins.analogSetPeriod(AnalogPin.P14, 200)
                pins.analogSetPeriod(AnalogPin.P13, 200)
            }

            if (speed2 < 0) {
                pins.analogWritePin(AnalogPin.P15, 0)
                pins.analogWritePin(AnalogPin.P16, -speed2)
                pins.analogSetPeriod(AnalogPin.P15, 200)
                pins.analogSetPeriod(AnalogPin.P16, 200)
            }
            else if (speed2 >= 0) {
                pins.analogWritePin(AnalogPin.P16, 0)
                pins.analogWritePin(AnalogPin.P15, speed2)
                pins.analogSetPeriod(AnalogPin.P16, 200)
                pins.analogSetPeriod(AnalogPin.P15, 200)
            }
        }
    }

    //% group="Motor Control"
    /**
     * Control motor speed 1 channel. The speed motor is adjustable between -100 to 100.
     */
    //% block="motorWrite %Motor_Write|Speed %Speed"
    //% speed.min=-100 speed.max=100
    export function motorWrite(motor: Motor_Write, speed: number): void {
        if (Read_ADC_Version == false) {
            let i2cData = pins.createBuffer(1)
            i2cData[0] = 132
            if (pins.i2cWriteBuffer(0x4b, i2cData, false) == 0) {
                ADC_Version = 2
            }
            else {
                ADC_Version = 1
            }
            Read_ADC_Version = true
        }

        if (ADC_Version == 1) {
            speed = pins.map(speed, -100, 100, -1023, 1023)

            if (motor == Motor_Write.Motor_1) {
                if (speed < 0) {
                    pins.digitalWritePin(DigitalPin.P13, 0)
                    pins.analogWritePin(AnalogPin.P14, -speed + 2)
                    pins.analogSetPeriod(AnalogPin.P14, 2000)
                }
                else if (speed >= 0) {
                    pins.digitalWritePin(DigitalPin.P13, 1)
                    pins.analogWritePin(AnalogPin.P14, speed - 2)
                    pins.analogSetPeriod(AnalogPin.P14, 2000)
                }
            }
            else if (motor == Motor_Write.Motor_2) {
                if (speed < 0) {
                    pins.digitalWritePin(DigitalPin.P15, 0)
                    pins.analogWritePin(AnalogPin.P16, -speed)
                    pins.analogSetPeriod(AnalogPin.P16, 2000)
                }
                else if (speed >= 0) {
                    pins.digitalWritePin(DigitalPin.P15, 1)
                    pins.analogWritePin(AnalogPin.P16, speed)
                    pins.analogSetPeriod(AnalogPin.P16, 2000)
                }
            }
        }
        else if (ADC_Version == 2) {
            speed = pins.map(speed, -100, 100, 1023, -1023)

            if (motor == Motor_Write.Motor_1) {
                if (speed < 0) {
                    pins.analogWritePin(AnalogPin.P13, 0)
                    pins.analogWritePin(AnalogPin.P14, -speed)
                    pins.analogSetPeriod(AnalogPin.P13, 200)
                    pins.analogSetPeriod(AnalogPin.P14, 200)
                }
                else if (speed >= 0) {
                    pins.analogWritePin(AnalogPin.P14, 0)
                    pins.analogWritePin(AnalogPin.P13, speed)
                    pins.analogSetPeriod(AnalogPin.P14, 200)
                    pins.analogSetPeriod(AnalogPin.P13, 200)
                }
            }
            else if (motor == Motor_Write.Motor_2) {
                if (speed < 0) {
                    pins.analogWritePin(AnalogPin.P15, 0)
                    pins.analogWritePin(AnalogPin.P16, -speed)
                    pins.analogSetPeriod(AnalogPin.P15, 200)
                    pins.analogSetPeriod(AnalogPin.P16, 200)
                }
                else if (speed >= 0) {
                    pins.analogWritePin(AnalogPin.P16, 0)
                    pins.analogWritePin(AnalogPin.P15, speed)
                    pins.analogSetPeriod(AnalogPin.P16, 200)
                    pins.analogSetPeriod(AnalogPin.P15, 200)
                }
            }
        }
    }

    //% group="Servo Control"
    /**
     * Control Servo Motor to Release Mode
     */
    //% block="Servo Stop %Servo_Write"
    export function servoStop(servo: Servo_Write): void {
        if (servo == Servo_Write.P8) {
            pins.analogWritePin(AnalogPin.P8, 1)
        }
        else if (servo == Servo_Write.P12) {
            pins.analogWritePin(AnalogPin.P12, 1)
        }
    }

    //% group="Servo Control"
    /**
     * Control Servo Motor 0 - 180 Degrees and Lock or Release Mode
     */
    //% block="Servo %Servo_Write|Degree %Degree|Mode %Servo_Mode"
    //% degree.min=0 degree.max=180
    export function servoWrite(servo: Servo_Write, degree: number, mode: Servo_Mode): void {
        if (servo == Servo_Write.P8) {
            if (mode == Servo_Mode.Lock) {
                pins.servoWritePin(AnalogPin.P8, degree)
            }
            else if (mode == Servo_Mode.Release) {
                pins.servoWritePin(AnalogPin.P8, degree)
                if (Math.abs(degree - last_degree_P8) * 5 < 100) {
                    basic.pause(100)
                }
                else {
                    basic.pause(Math.abs(degree - last_degree_P8) * 5)
                }
                pins.analogWritePin(AnalogPin.P8, 1)
            }
            last_degree_P8 = degree
        }
        else if (servo == Servo_Write.P12) {
            if (mode == Servo_Mode.Lock) {
                pins.servoWritePin(AnalogPin.P12, degree)
            }
            else if (mode == Servo_Mode.Release) {
                pins.servoWritePin(AnalogPin.P12, degree)
                if (Math.abs(degree - last_degree_P12) * 5 < 100) {
                    basic.pause(100)
                }
                else {
                    basic.pause(Math.abs(degree - last_degree_P12) * 5)
                }
                pins.analogWritePin(AnalogPin.P12, 1)
            }
            last_degree_P12 = degree
        }
    }

    //% group="Servo Control"
    /**
     * Control Servo Motor 0 - 180 Degrees
     */
    //% block="Servo %Servo_Write|Degree %Degree"
    //% degree.min=0 degree.max=180
    export function servoWrite2(servo: Servo_Write2, degree: number): void {
        if (servo == Servo_Write2.P8) {
            pins.servoWritePin(AnalogPin.P8, degree)
            last_degree_P8 = degree
        }
        else if (servo == Servo_Write2.P12) {
            pins.servoWritePin(AnalogPin.P12, degree)
            last_degree_P12 = degree
        }
        else if (servo == Servo_Write2.S0) {
            setServoPCA(0, degree)
        }
        else if (servo == Servo_Write2.S1) {
            setServoPCA(1, degree)
        }
        else if (servo == Servo_Write2.S2) {
            setServoPCA(2, degree)
        }
        else if (servo == Servo_Write2.S3) {
            setServoPCA(3, degree)
        }
        else if (servo == Servo_Write2.S4) {
            setServoPCA(4, degree)
        }
        else if (servo == Servo_Write2.S5) {
            setServoPCA(5, degree)
        }
        else if (servo == Servo_Write2.S6) {
            setServoPCA(6, degree)
        }
        else if (servo == Servo_Write2.S7) {
            setServoPCA(7, degree)
        }
    }

    //% group="Sensor and ADC"
    /**
     * Read Distance from Ultrasonic Sensor
     */
    //% block="GETDistance Triger %Trigger_PIN|Echo %Echo_PIN"
    //% Echo_PIN.defl=Ultrasonic_PIN.P2
    export function distanceRead(Trigger_PIN: Ultrasonic_PIN, Echo_PIN: Ultrasonic_PIN): number {
        let duration
        let maxCmDistance = 500

        if (control.millis() - timer > 1000) {
            if (Trigger_PIN == Ultrasonic_PIN.P1 && Echo_PIN == Ultrasonic_PIN.P2) {
                pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
                pins.digitalWritePin(DigitalPin.P1, 0)
                control.waitMicros(2)
                pins.digitalWritePin(DigitalPin.P1, 1)
                control.waitMicros(10)
                pins.digitalWritePin(DigitalPin.P1, 0)
                duration = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 58)
                distance = Math.idiv(duration, 58)
            }
            else if (Trigger_PIN == Ultrasonic_PIN.P2 && Echo_PIN == Ultrasonic_PIN.P1) {
                pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
                pins.digitalWritePin(DigitalPin.P2, 0)
                control.waitMicros(2)
                pins.digitalWritePin(DigitalPin.P2, 1)
                control.waitMicros(10)
                pins.digitalWritePin(DigitalPin.P2, 0)
                duration = pins.pulseIn(DigitalPin.P1, PulseValue.High, maxCmDistance * 58)
                distance = Math.idiv(duration, 58)
            }
        }

        if (Trigger_PIN == Ultrasonic_PIN.P1 && Echo_PIN == Ultrasonic_PIN.P2) {
            pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
            pins.digitalWritePin(DigitalPin.P1, 0)
            control.waitMicros(2)
            pins.digitalWritePin(DigitalPin.P1, 1)
            control.waitMicros(10)
            pins.digitalWritePin(DigitalPin.P1, 0)
            duration = pins.pulseIn(DigitalPin.P2, PulseValue.High, maxCmDistance * 58)
        }
        else if (Trigger_PIN == Ultrasonic_PIN.P2 && Echo_PIN == Ultrasonic_PIN.P1) {
            pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
            pins.digitalWritePin(DigitalPin.P2, 0)
            control.waitMicros(2)
            pins.digitalWritePin(DigitalPin.P2, 1)
            control.waitMicros(10)
            pins.digitalWritePin(DigitalPin.P2, 0)
            duration = pins.pulseIn(DigitalPin.P1, PulseValue.High, maxCmDistance * 58)
        }
        
        let d = Math.idiv(duration, 58)

        if (d != 0) {
            distance = (0.1 * d) + (1 - 0.1) * distance
        }
        timer = control.millis()
        return Math.round(distance)
    }

    //% group="Sensor and ADC"
    /**
     * Read Analog from ADC Channel
     */
    //% block="ADCRead %ADC_Read"
    export function ADCRead(ADCRead: ADC_Read): number {
        if (Read_ADC_Version == false) {
            let i2cData = pins.createBuffer(1)
            i2cData[0] = 132
            if (pins.i2cWriteBuffer(0x4b, i2cData, false) == 0) {
                ADC_Version = 2
            }
            else {
                ADC_Version = 1
            }
            Read_ADC_Version = true
        }

        if (ADC_Version == 1) {
            pins.i2cWriteNumber(0x48, ADCRead, NumberFormat.UInt8LE, false)
            return ADCRead = pins.i2cReadNumber(0x48, NumberFormat.UInt16BE, false)
        }
        else if (ADC_Version == 2) {
            pins.i2cWriteNumber(0x4b, ADCRead, NumberFormat.UInt8LE, false)
            return ADCRead = pins.i2cReadNumber(0x4b, NumberFormat.UInt8LE, false)
        }
        else {
            return 0
        }
    }

    //% group="Sensor and ADC"
    /**
     * Wait for the button to be pressed or released.
     */
    //% block="WaitButton %Button_Pin|is %Button_Status"
    //% speed.min=-100 speed.max=100
    export function waitClick(button_pin: Button_Pin, button_status: Button_Status): void {
        if (button_status == Button_Status.Pressed) {
            if (button_pin == Button_Pin.P1) {
                while (pins.digitalReadPin(DigitalPin.P1) == 0);
            }
            else if (button_pin == Button_Pin.P2) {
                while (pins.digitalReadPin(DigitalPin.P2) == 0);
            }
            else if (button_pin == Button_Pin.P8) {
                while (pins.digitalReadPin(DigitalPin.P8) == 0);
            }
            else if (button_pin == Button_Pin.P12) {
                while (pins.digitalReadPin(DigitalPin.P12) == 0);
            }
        }
        else {
            if (button_pin == Button_Pin.P1) {
                while (pins.digitalReadPin(DigitalPin.P1) == 1);
            }
            else if (button_pin == Button_Pin.P2) {
                while (pins.digitalReadPin(DigitalPin.P2) == 1);
            }
            else if (button_pin == Button_Pin.P8) {
                while (pins.digitalReadPin(DigitalPin.P8) == 1);
            }
            else if (button_pin == Button_Pin.P12) {
                while (pins.digitalReadPin(DigitalPin.P12) == 1);
            }
        }
    }

    //% group="Line Follower"
    /**
     * Turn Left or Right Follower Line Mode
     */
    //% block="TurnLINE %turn|Speed\n %speed|Sensor %sensor|Fast Time\n %time|Break Time %break_delay"
    //% speed.min=0 speed.max=100
    //% time.shadow="timePicker"
    //% break_delay.shadow="timePicker"
    //% time.defl=200
    //% break_delay.defl=20
    export function TurnLINE(turn: Turn_Line, speed: number, sensor: number, time: number, break_delay: number) {
        let ADC_PIN = [
            ADC_Read.ADC0,
            ADC_Read.ADC1,
            ADC_Read.ADC2,
            ADC_Read.ADC3,
            ADC_Read.ADC4,
            ADC_Read.ADC5,
            ADC_Read.ADC6,
            ADC_Read.ADC7
        ]
        let on_line = 0
        let adc_sensor_pin = sensor - 1
        // let position = pins.map(sensor, 1, Num_Sensor, 0, (Num_Sensor - 1) * 1000)
        let error = 0
        let timer = 0
        let motor_speed = 0
        let motor_slow = Math.round(speed / 2)
        while (1) {
            on_line = 0
            for (let i = 0; i < Sensor_PIN.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Line[i], Color_Background[i], 1000, 0)) >= 800) {
                    on_line += 1;
                }
            }

            if (on_line == 0) {
                break
            }

            if (turn == Turn_Line.Left) {
                motorGo(-speed, speed)
            }
            else if (turn == Turn_Line.Right) {
                motorGo(speed, -speed)
            }
        }
        timer = control.millis()
        while (1) {
            if ((pins.map(ADCRead(ADC_PIN[Sensor_PIN[adc_sensor_pin]]), Color_Line[adc_sensor_pin], Color_Background[adc_sensor_pin], 1000, 0)) >= 800) {
                basic.pause(break_delay)
                motorStop()
                break
            }
            else {
                error = timer - (control.millis() - time)
                motor_speed = error

                if (motor_speed > 100) {
                    motor_speed = 100
                }
                else if (motor_speed < 0) {
                    motor_speed = motor_slow
                }

                if (turn == Turn_Line.Left) {
                    motorGo(-motor_speed, motor_speed)
                }
                else if (turn == Turn_Line.Right) {
                    motorGo(motor_speed, -motor_speed)
                }
            }
        }
    }

    //% group="Line Follower"
    /**
     * Line Follower Forward Timer
     */
    //% block="Direction %Forward_Direction|Time %time|Min Speed %base_speed|Max Speed %max_speed|KP %kp|KD %kd"
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    //% time.shadow="timePicker"
    //% time.defl=200
    export function ForwardTIME(direction: Forward_Direction, time: number, min_speed: number, max_speed: number, kp: number, kd: number) {
        let timer = control.millis()
        while (control.millis() - timer < time) {
            error = GETPosition() - (((Num_Sensor - 1) * 1000) / 2)
            P = error
            D = error - previous_error
            PD_Value = (kp * P) + (kd * D)
            previous_error = error

            left_motor_speed = min_speed - PD_Value
            right_motor_speed = min_speed + PD_Value

            if (left_motor_speed > max_speed) {
                left_motor_speed = max_speed
            }
            else if (left_motor_speed < -max_speed) {
                left_motor_speed = -max_speed
            }

            if (right_motor_speed > max_speed) {
                right_motor_speed = max_speed
            }
            else if (right_motor_speed < -max_speed) {
                right_motor_speed = -max_speed
            }

            if (direction == Forward_Direction.Forward) {
                motorGo(left_motor_speed, right_motor_speed)
            }
            else {
                motorGo(-left_motor_speed, -right_motor_speed)
            }
        }
        motorStop()
    }
    //% group="Line Follower"
    /**
     * Line Follower Forward with Counter Line
     */
    //% block="Direction %Forward_Direction|Find %Find_Line|Count Line %count|Min Speed\n %base_speed|Max Speed\n %max_speed|Break Time %break_time|KP %kp|KD %kd"
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    //% break_time.shadow="timePicker"
    //% count.defl=2
    //% break_time.defl=20
    export function ForwardLINECount(direction: Forward_Direction, find: Find_Line, count: number, min_speed: number, max_speed: number, break_time: number, kp: number, kd: number) {
        for (let i = 0; i < count; i++) {
            if (i < count - 1) {
                ForwardLINE(direction, find, min_speed, max_speed, 0, kp, kd)
            }
            else {
                ForwardLINE(direction, find, min_speed, max_speed, break_time, kp, kd)
            }
        }
    }

    //% group="Line Follower"
    /**
     * Line Follower Forward
     */
    //% block="Direction %Forward_Direction|Find %Find_Line|Min Speed\n %base_speed|Max Speed\n %max_speed|Break Time %break_time|KP %kp|KD %kd"
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    //% break_time.shadow="timePicker"
    //% break_time.defl=20
    export function ForwardLINE(direction: Forward_Direction, find: Find_Line, min_speed: number, max_speed: number, break_time: number, kp: number, kd: number) {
        let ADC_PIN = [
            ADC_Read.ADC0,
            ADC_Read.ADC1,
            ADC_Read.ADC2,
            ADC_Read.ADC3,
            ADC_Read.ADC4,
            ADC_Read.ADC5,
            ADC_Read.ADC6,
            ADC_Read.ADC7
        ]
        let found_left = 0
        let found_right = 0
        let last_left = 0
        let last_center = 0
        let last_right = 0
        let line_state = 0
        let on_line = 0
        let on_line_LR = 0

        while (1) {
            for (let i = 0; i < Sensor_PIN.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Line[i], Color_Background[i], 1000, 0)) >= 200) {
                    last_center += 1
                }
            }

            error = GETPosition() - (((Num_Sensor - 1) * 1000) / 2)
            P = error
            D = error - previous_error
            PD_Value = (kp * P) + (kd * D)
            previous_error = error

            if (direction == Forward_Direction.Forward) {
                left_motor_speed = min_speed - PD_Value
                right_motor_speed = min_speed + PD_Value
            }
            else {
                left_motor_speed = min_speed + PD_Value
                right_motor_speed = min_speed - PD_Value
            }

            if (left_motor_speed > max_speed) {
                left_motor_speed = max_speed
            }
            else if (left_motor_speed < -max_speed) {
                left_motor_speed = -max_speed
            }

            if (right_motor_speed > max_speed) {
                right_motor_speed = max_speed
            }
            else if (right_motor_speed < -max_speed) {
                right_motor_speed = -max_speed
            }

            if (direction == Forward_Direction.Forward) {
                if (last_center > 0) {
                    motorGo(left_motor_speed, right_motor_speed)
                }
                else {
                    motorGo(min_speed, min_speed)
                }
            }
            else {
                if (last_center > 0) {
                    motorGo(-left_motor_speed, -right_motor_speed)
                }
                else {
                    motorGo(-min_speed, -min_speed)
                }
            }

            last_center = 0

            for (let i = 0; i < Sensor_Left.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_Left[i]]), Color_Line_Left[i], Color_Background_Left[i], 1000, 0)) >= 800) {
                    if (found_left < Sensor_Left.length) {
                        found_left += 1
                    }
                }
            }

            for (let i = 0; i < Sensor_Right.length; i++) {
                if ((pins.map(ADCRead(ADC_PIN[Sensor_Right[i]]), Color_Line_Right[i], Color_Background_Right[i], 1000, 0)) >= 800) {
                    if (found_right < Sensor_Right.length) {
                        found_right += 1
                    }
                }
            }

            if (line_state == 0) {
                if (found_left == Sensor_Left.length || found_right == Sensor_Right.length) {
                    line_state = 1
                }
            }
            else if (line_state == 1) {
                if (direction == Forward_Direction.Forward) {
                    motorGo(min_speed, min_speed)
                }
                else {
                    motorGo(-min_speed, -min_speed)
                }
                while (1) {
                    for (let i = 0; i < Sensor_Left.length; i++) {
                        if ((pins.map(ADCRead(ADC_PIN[Sensor_Left[i]]), Color_Line_Left[i], Color_Background_Left[i], 1000, 0)) >= 800) {
                            last_left += 1
                            if (found_left < Sensor_Left.length) {
                                found_left += 1
                            }
                        }
                    }

                    for (let i = 0; i < Sensor_Right.length; i++) {
                        if ((pins.map(ADCRead(ADC_PIN[Sensor_Right[i]]), Color_Line_Right[i], Color_Background_Right[i], 1000, 0)) >= 800) {
                            last_right += 1
                            if (found_right < Sensor_Right.length) {
                                found_right += 1
                            }
                        }
                    }

                    if (last_left != Sensor_Left.length && last_right != Sensor_Right.length) {
                        line_state = 2
                        break
                    }

                    last_left = 0
                    last_right = 0
                }
            }
            else if (line_state == 2) {
                if (find == Find_Line.Left) {
                    if (found_left == Sensor_Left.length && found_right != Sensor_Right.length) {
                        if (direction == Forward_Direction.Forward) {
                            motorGo(-100, -100)
                        }
                        else {
                            motorGo(100, 100)
                        }
                        basic.pause(break_time)
                        motorStop()
                        break
                    }
                    else {
                        found_left = 0
                        found_right = 0
                        line_state = 0
                    }
                }
                else if (find == Find_Line.Center) {
                    if (found_left == Sensor_Left.length && found_right == Sensor_Right.length) {
                        if (direction == Forward_Direction.Forward) {
                            motorGo(-100, -100)
                        }
                        else {
                            motorGo(100, 100)
                        }
                        basic.pause(break_time)
                        motorStop()
                        break
                    }
                    else {
                        found_left = 0
                        found_right = 0
                        line_state = 0
                    }
                }
                else if (find == Find_Line.Right) {
                    if (found_left != Sensor_Left.length && found_right == Sensor_Right.length) {
                        if (direction == Forward_Direction.Forward) {
                            motorGo(-100, -100)
                        }
                        else {
                            motorGo(100, 100)
                        }
                        basic.pause(break_time)
                        motorStop()
                        break
                    }
                    else {
                        found_left = 0
                        found_right = 0
                        line_state = 0
                    }
                }
            }
        }
    }

    //% group="Line Follower"
    /**
     * Basic Line Follower
     */
    //% block="Min Speed %base_speed|Max Speed %max_speed|KP %kp|KD %kd"
    //% min_speed.min=0 min_speed.max=100
    //% max_speed.min=0 max_speed.max=100
    export function Follower(min_speed: number, max_speed: number, kp: number, kd: number) {
        error = GETPosition() - (((Num_Sensor - 1) * 1000) / 2)
        P = error
        D = error - previous_error
        PD_Value = (kp * P) + (kd * D)
        previous_error = error

        left_motor_speed = min_speed - PD_Value
        right_motor_speed = min_speed + PD_Value

        if (left_motor_speed > max_speed) {
            left_motor_speed = max_speed
        }
        else if (left_motor_speed < -max_speed) {
            left_motor_speed = -max_speed
        }

        if (right_motor_speed > max_speed) {
            right_motor_speed = max_speed
        }
        else if (right_motor_speed < -max_speed) {
            right_motor_speed = -max_speed
        }

        motorGo(left_motor_speed, right_motor_speed)
    }

    //% group="Line Follower"
    /**
     * Get Position Line
     */
    //% block="GETPosition"
    export function GETPosition() {
        let ADC_PIN = [
            ADC_Read.ADC0,
            ADC_Read.ADC1,
            ADC_Read.ADC2,
            ADC_Read.ADC3,
            ADC_Read.ADC4,
            ADC_Read.ADC5,
            ADC_Read.ADC6,
            ADC_Read.ADC7
        ]
        let Average = 0
        let Sum_Value = 0
        let ON_Line = 0

        for (let i = 0; i < Num_Sensor; i++) {
            let Value_Sensor = 0;
            if (Line_Mode == 0) {
                Value_Sensor = pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Line[i], Color_Background[i], 1000, 0)
                if (Value_Sensor < 0) {
                    Value_Sensor = 0
                }
                else if (Value_Sensor > 1000) {
                    Value_Sensor = 1000
                }
            }
            else {
                Value_Sensor = pins.map(ADCRead(ADC_PIN[Sensor_PIN[i]]), Color_Background[i], Color_Line[i], 1000, 0)
                if (Value_Sensor < 0) {
                    Value_Sensor = 0
                }
                else if (Value_Sensor > 1000) {
                    Value_Sensor = 1000
                }
            }
            if (Value_Sensor > 200) {
                ON_Line = 1;
                Average += Value_Sensor * (i * 1000)
                Sum_Value += Value_Sensor
            }
        }
        if (ON_Line == 0) {
            if (Last_Position < (Num_Sensor - 1) * 1000 / 2) {
                return (Num_Sensor - 1) * 1000
            }
            else {
                return 0
            }
        }
        Last_Position = Average / Sum_Value;
        return Math.round(((Num_Sensor - 1) * 1000) - Last_Position)
    }

    //% group="Line Follower"
    /**
     * Print Sensor Value
     */
    //% block="PrintSensorValue"
    export function PrintSensorValue() {
        let ADC_PIN = [
            ADC_Read.ADC0,
            ADC_Read.ADC1,
            ADC_Read.ADC2,
            ADC_Read.ADC3,
            ADC_Read.ADC4,
            ADC_Read.ADC5,
            ADC_Read.ADC6,
            ADC_Read.ADC7
        ]

        let sensor_left = "Sensor Left:"
        let sensor_center = "Sensor Center:"
        let sensor_right = "Sensor Right:"

        for (let i = 0; i < Sensor_Left.length; i++) {
            sensor_left += " " + ADCRead(ADC_PIN[Sensor_Left[i]])
        }

        for (let i = 0; i < Sensor_PIN.length; i++) {
            sensor_center += " " + ADCRead(ADC_PIN[Sensor_PIN[i]])
        }

        for (let i = 0; i < Sensor_Right.length; i++) {
            sensor_right += " " + ADCRead(ADC_PIN[Sensor_Right[i]])
        }

        serial.writeLine("" + sensor_left)
        serial.writeLine("" + sensor_center)
        serial.writeLine("" + sensor_right)
    }

    //% group="Line Follower"
    /**
     * Set Value Sensor
     */
    //% block="SETColorLine\n\n $line_center|Line Left\n\n\n\n\n $line_left|Line Right\n\n\n\n $line_right|SETColorGround $ground_center|Ground Left\n\n\n $ground_left|Ground Right\n\n $ground_right"
    export function ValueSensorSET(line_center: number[], line_left: number[], line_right: number[], ground_center: number[], ground_left: number[], ground_right: number[]): void {
        Color_Line = line_center
        Color_Line_Left = line_left
        Color_Line_Right = line_right
        Color_Background = ground_center
        Color_Background_Left = ground_left
        Color_Background_Right = ground_right
    }

    //% group="Line Follower"
    /**
     * Set Line Sensor Pin
     */
    //% block="LINESensorSET $adc_pin|Sensor Left\n\n $sensor_left|Sensor Right\n $sensor_right|ON OFF Sensor $led_pin"
    export function LINESensorSET(adc_pin: number[], sensor_left: number[], sensor_right: number[], led_pin: LED_Pin): void {
        Sensor_PIN = adc_pin
        Sensor_Left = sensor_left
        Sensor_Right = sensor_right
        Num_Sensor = Sensor_PIN.length
        LED_PIN = led_pin
    }

    //% group="Line Follower"
    /**
     * Calibrate Sensor
     */
    //% block="SensorCalibrate $adc_pin"
    export function SensorCalibrate(adc_pin: number[]): void {
        let ADC_PIN = [
            ADC_Read.ADC0,
            ADC_Read.ADC1,
            ADC_Read.ADC2,
            ADC_Read.ADC3,
            ADC_Read.ADC4,
            ADC_Read.ADC5,
            ADC_Read.ADC6,
            ADC_Read.ADC7
        ]
        let _Sensor_PIN = adc_pin
        let _Num_Sensor = _Sensor_PIN.length
        let Line_Cal = [0, 0, 0, 0, 0, 0, 0, 0]
        let Background_Cal = [0, 0, 0, 0, 0, 0, 0, 0]

        music.playTone(587, music.beat(BeatFraction.Quarter))
        music.playTone(784, music.beat(BeatFraction.Quarter))
        ////Calibrate Follower Line
        while (!input.buttonIsPressed(Button.A));
        music.playTone(784, music.beat(BeatFraction.Quarter))
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < _Num_Sensor; j++) {
                Line_Cal[j] += ADCRead(ADC_PIN[_Sensor_PIN[j]])
            }
            basic.pause(50)
        }
        for (let i = 0; i < _Num_Sensor; i++) {
            Line_Cal[i] = Line_Cal[i] / 20
            for (let j = 0; j < Sensor_Left.length; j++) {
                if (Sensor_Left[j] == _Sensor_PIN[i]) {
                    Color_Line_Left.push(Line_Cal[i])
                }
            }
            for (let j = 0; j < Sensor_PIN.length; j++) {
                if (Sensor_PIN[j] == _Sensor_PIN[i]) {
                    Color_Line.push(Line_Cal[i])
                }
            }
            for (let j = 0; j < Sensor_Right.length; j++) {
                if (Sensor_Right[j] == _Sensor_PIN[i]) {
                    Color_Line_Right.push(Line_Cal[i])
                }
            }
        }
        music.playTone(784, music.beat(BeatFraction.Quarter))

        ////Calibrate Background
        while (!input.buttonIsPressed(Button.A));
        music.playTone(784, music.beat(BeatFraction.Quarter))
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < _Num_Sensor; j++) {
                Background_Cal[j] += ADCRead(ADC_PIN[_Sensor_PIN[j]])
            }
            basic.pause(50)
        }
        for (let i = 0; i < _Num_Sensor; i++) {
            Background_Cal[i] = Background_Cal[i] / 20
            for (let j = 0; j < Sensor_Left.length; j++) {
                if (Sensor_Left[j] == _Sensor_PIN[i]) {
                    Color_Background_Left.push(Background_Cal[i])
                }
            }
            for (let j = 0; j < Sensor_PIN.length; j++) {
                if (Sensor_PIN[j] == _Sensor_PIN[i]) {
                    Color_Background.push(Background_Cal[i])
                }
            }
            for (let j = 0; j < Sensor_Right.length; j++) {
                if (Sensor_Right[j] == _Sensor_PIN[i]) {
                    Color_Background_Right.push(Background_Cal[i])
                }
            }
        }
        music.playTone(784, music.beat(BeatFraction.Quarter))
        music.playTone(587, music.beat(BeatFraction.Quarter))
        basic.pause(500)
    }
}