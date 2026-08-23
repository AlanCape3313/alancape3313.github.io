import { Group, Mesh, MeshStandardMaterial, Object3D } from 'three';

export class BoneStructure {
	constructor(scene) {
		this.bones = new Map();

		scene.name = 'structure_root';

		const recurse = (obj) => {
			if (this.bones.has(obj.name)) {
				console.warn(`Duplicate bone name: '${obj.name}'`);
			}

			if (obj instanceof Mesh) {
				const mat = obj.material;
				if (mat instanceof MeshStandardMaterial) {
					if (obj.name.endsWith('_emissive')) {
						mat.emissive.set(0xffffff);
						mat.emissiveMap = mat.map;
						mat.emissiveIntensity = 0.75;
					}
					// mat.transparent = true;
				}
			}

			this.bones.set(obj.name, obj);

			for (const child of obj.children) {
				recurse(child);
			}
		};

		recurse(scene);
	}

	getBone(name) {
		return this.bones.get(name);
	}
}