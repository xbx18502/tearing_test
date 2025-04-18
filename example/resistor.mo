model SeriesResistor
  connector Pin
    Voltage v "Voltage at the pin";
    flow Current i "Current flowing through the pin";
  end Pin;

  model Resistor
    parameter Real R "Resistance value in Ohms";
    Pin p, n; // Positive and negative terminals for the resistor

  equation
    // Ohm's law applied to the resistor
    p.v - n.v = R * p.i; // Voltage difference across the resistor
    p.i + n.i = 0;       // Current continuity (Kirchhoff’s Current Law)
  end Resistor;

  model VoltageSourceAC
    parameter Real V_amplitude = 10 "Amplitude of the AC voltage";
    parameter Real freq = 50 "Frequency of the AC source in Hz";
    parameter Real phase = 0 "Phase of the AC source in radians";
    parameter Real offset = 0 "DC offset of the AC voltage";

    Pin p, n; // Positive and negative terminals for the AC source

  equation
    // Define the AC voltage as a sinusoidal function of time
    p.v - n.v = V_amplitude * sin(2 * Modelica.Constants.pi * freq * time + phase) + offset;
    p.i + n.i = 0; // Current continuity
  end VoltageSourceAC;

  model Ground
    Pin p; // Ground terminal

  equation
    p.v = 0; // Voltage at ground is zero
  end Ground;

  type Voltage = Real(unit = "V");
  type Current = Real(unit = "A");
  type Resistance = Real(unit = "Ohm");

  parameter Resistance R1 = 100 "Resistance of R1";
  parameter Resistance R2 = 200 "Resistance of R2";

  Voltage v1, v2, v3;
  Current i;

  Resistor res1(R = R1);
  Resistor res2(R = R2);
  VoltageSourceAC vSourceAC(V_amplitude = 10, freq = 50); // AC voltage source with specified amplitude and frequency
  Ground ground;                 // Ground component

equation
  // Connections
  connect(res1.p, res2.n);         // Connect positive terminal of res1 to negative terminal of res2
  connect(res1.n, ground.p);       // Connect negative terminal of res1 to ground
  connect(res2.p, vSourceAC.p);    // Connect positive terminal of res2 to positive terminal of vSourceAC
  connect(ground.p, vSourceAC.n);  // Connect ground to the negative terminal of vSourceAC

  // Voltage definitions for tracking
  v1 = vSourceAC.V_amplitude * sin(2 * Modelica.Constants.pi * vSourceAC.freq * time + vSourceAC.phase) + vSourceAC.offset; // AC source voltage
  v2 = res1.p.v - res1.n.v;       // Voltage across res1
  v3 = res2.p.v - res2.n.v;       // Voltage across res2

  // Define the circuit current
  i = res1.p.i;                   // Set i to the current flowing through res1 (same for entire series circuit)
end SeriesResistor;