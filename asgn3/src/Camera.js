// camera.js
class Camera {
  constructor() {
    this.fov = 60;
    this.eye = new Vector3([0, 0, 0]);
    this.at  = new Vector3([0, 0, -1]);
    this.up  = new Vector3([0, 1, 0]);
    this.speed = 0.2;

    this.viewMatrix       = new Matrix4();
    this.projectionMatrix = new Matrix4();

    this.updateViewMatrix();
    this.projectionMatrix.setPerspective(
      this.fov,
      canvas.width / canvas.height,
      0.1,
      1000
    );
  }

  updateViewMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
      this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
    );
  }

  moveForward() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    f.mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
    this.updateViewMatrix();
  }

  moveBackwards() {
    let b = new Vector3();
    b.set(this.eye);
    b.sub(this.at);
    b.normalize();
    b.mul(this.speed);
    this.eye.add(b);
    this.at.add(b);
    this.updateViewMatrix();
  }

  moveLeft() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(this.speed);

    this.eye.add(s);
    this.at.add(s);
    this.updateViewMatrix();
  }

  moveRight() {
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(this.speed);

    this.eye.add(s);
    this.at.add(s);
    this.updateViewMatrix();
  }

  panLeft() {
    let alpha = 5;
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let rotMatrix = new Matrix4();
    rotMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let f_prime = rotMatrix.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);
    this.updateViewMatrix();
  }

  panRight() {
    let alpha = -5;
    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    let rotMatrix = new Matrix4();
    rotMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    let f_prime = rotMatrix.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(f_prime);
    this.updateViewMatrix();
  }

  // mouse rotation
  panByDelta(deltaX, deltaY) {
    let sensitivity = 0.3;

    let f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);

    // yaw
    if (deltaX !== 0) {
      let rotY = new Matrix4();
      rotY.setRotate(-deltaX * sensitivity,
        this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      f.set(rotY.multiplyVector3(f));
    }

    // pitch
    if (deltaY !== 0) {
      let right = Vector3.cross(f, this.up);
      right.normalize();
      let rotX = new Matrix4();
      rotX.setRotate(-deltaY * sensitivity,
        right.elements[0], right.elements[1], right.elements[2]);
      f.set(rotX.multiplyVector3(f));
    }

    this.at.set(this.eye);
    this.at.add(f);
    this.updateViewMatrix();
  }
}
