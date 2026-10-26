# Versioned JSON migration example

The [synthetic version-zero fixture](examples/legacy-static-2d-v0.json) demonstrates a controlled upgrade from a minimal legacy-style document to Sceneology's current scene v1 representation. **This fixture is invented solely to test the upgrade contract. It is not from a historical private project and does not demonstrate that earlier project files are compatible.**

The [migration implementation](../scripts/migrate-scene-v0.mjs) checks shape types, IDs, colors, positive extents, bounds, and exact input version before emitting a v1 `2d` scene. It maps `canvas` to `frame`, `shapes` to `elements`, positions to transforms, and shapes' source order to presentation draw order. It emits an explicit `declarative-only` realization, never a fictional renderer or artistic approval.

The integration test runs positive fixtures through JSON serialization/deserialization and checks stable IDs and semantic equivalence; it also requires malformed versions, duplicate objects, unsupported shapes and invalid coordinate data to fail. Future schemas require their own published migration rules, and real historical source formats require source-specific adapters after proper rights, dependency and meaning review.

This is a limited proof of the public schema-evolution mechanism, not an assertion of full historical semantic parity.
