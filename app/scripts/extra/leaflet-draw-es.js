L.drawLocal = {
	draw: {
		toolbar: {
			actions: {
				title: 'Cancelar acción',
				text: 'Cancelar'
			},
			undo: {
				title: 'Borrar último punto',
				text: 'Borrar último punto'
			},
			buttons: {
				polyline: 'Dibujar polilínea',
				polygon: 'Dibujar polígono',
				rectangle: 'Dibujar rectángulo',
				circle: 'Dibujar círculo',
				marker: 'Dibujar marcador'
			}
		},
		handlers: {
			circle: {
				tooltip: {
					start: 'Click and drag to draw circle.'
				}
			},
			marker: {
				tooltip: {
					start: 'Click map to place marker.'
				}
			},
			polygon: {
				tooltip: {
					start: 'Cliquea para crear polígono.',
					cont: 'Cliquea para colocar nuevo vértice.',
					end: 'Cliquea el primer punto para cerrar polígono.'
				}
			},
			polyline: {
				error: '<strong>Error:</strong> shape edges cannot cross!',
				tooltip: {
					start: 'Click to start drawing line.',
					cont: 'Click to continue drawing line.',
					end: 'Click last point to finish line.'
				}
			},
			rectangle: {
				tooltip: {
					start: 'Click and drag to draw rectangle.'
				}
			},
			simpleshape: {
				tooltip: {
					end: 'Release mouse to finish drawing.'
				}
			}
		}
	},
	edit: {
		toolbar: {
			actions: {
				save: {
					title: 'Guardar cambios.',
					text: 'Guardar'
				},
				cancel: {
					title: 'Cancelar edición, descartar cambios.',
					text: 'Cancelar'
				}
			},
			buttons: {
				edit: 'Edit layers.',
				editDisabled: 'No layers to edit.',
				remove: 'Delete layers.',
				removeDisabled: 'No layers to delete.'
			}
		},
		handlers: {
			edit: {
				tooltip: {
					text: 'Edita arrastrando los vértices.',
					subtext: 'Cliquea cancelar para descartar cambios.'
				}
			},
			remove: {
				tooltip: {
					text: 'Selecciona el polígono a borrar y cliquea en "guardar"'
				}
			}
		}
	}
};
