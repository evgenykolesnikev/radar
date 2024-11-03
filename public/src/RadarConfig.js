export class RadarConfig {
  constructor(formElement, callback) {
    this.formElement = formElement;
    this.callback = callback;

    this.measurementsInput = this.formElement.querySelector("#measurementsPerRotation");
    this.rotationSpeedInput = this.formElement.querySelector("#rotationSpeed");
    this.targetSpeedInput = this.formElement.querySelector("#targetSpeed");

    this.formElement.addEventListener("submit", this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();

    const measurementsPerRotation = this.measurementsInput.value.trim();
    const rotationSpeed = this.rotationSpeedInput.value.trim();
    const targetSpeed = this.targetSpeedInput.value.trim();

    const formData = {
      measurementsPerRotation: measurementsPerRotation,
      rotationSpeed: rotationSpeed,
      targetSpeed: targetSpeed,
    };

    this.callback(formData);
  }

  setConfig(config) {
    this.measurementsInput.value = config.measurementsPerRotation || "";
    this.rotationSpeedInput.value = config.rotationSpeed || "";
    this.targetSpeedInput.value = config.targetSpeed || "";
  }
}
