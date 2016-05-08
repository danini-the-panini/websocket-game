import THREE from "three";

chai.use(function() {
  const Assertion = chai.Assertion;

  function closeTo(a, b, delta = 0.0001) {
    return Math.abs(a - b) < delta;
  }

  function assertVector2(x, y) {
    new Assertion(this._obj).to.be.instanceof(THREE.Vector2);
    this.assert(
      closeTo(this._obj.x, x) && closeTo(this._obj.y, y),
      "expected #{this} to be #{exp} but was #{act}",
      "expected #{this} to not be #{act}",
      `(${x}, ${y})`,
      `(${this._obj.toArray().join(", ")})`
    );
  }

  function assertVector3(x, y, z) {
    new Assertion(this._obj).to.be.instanceof(THREE.Vector3);
    this.assert(
      closeTo(this._obj.x, x) && closeTo(this._obj.y, y) && closeTo(this._obj.z, z),
      "expected #{this} to be #{exp} but was #{act}",
      "expected #{this} to not be #{act}",
      `(${x}, ${y}, ${z})`,
      `(${this._obj.toArray().join(", ")})`
    );
  }

  function assertVector4(x, y, z, w) {
    new Assertion(this._obj).to.be.instanceof(THREE.Vector4);
    this.assert(
      closeTo(this._obj.x, x) && closeTo(this._obj.y, y) && closeTo(this._obj.z, z) && closeTo(this._obj.w, w),
      "expected #{this} to be #{exp} but was #{act}",
      "expected #{this} to not be #{act}",
      `(${x}, ${y}, ${z}, ${w})`,
      `(${this._obj.toArray().join(", ")})`
    );
  }

  Assertion.addMethod("vector2", assertVector2);
  Assertion.addMethod("vector3", assertVector3);
  Assertion.addMethod("vector4", assertVector4);
});
