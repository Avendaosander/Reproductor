let fila = [];

class Pila {
    constructor() {
        this.items = [];
        this.top = 0;
    };

    push(data) {
        this.items[this.top] = data;
        this.top++;
    };

    popPila() {
        let deleteData;

        if (this.top) {
            deleteData = this.items[this.top - 1];
            delete this.items[this.top - 1];
            this.top--;
            return deleteData;
        };
    };

    getSizePila() {
        return this.top;
    };

    isEmpty() {
        if (!this.getSizePila()) {
            return true;
        } else {
            return false;
        };
    };

    peek() {
        if (this.isEmpty()) {
            return null;
        };
        return this.items[this.top - 1]
    };

    printPila() {
        for (let i = this.top; i > 0; i--) {
            console.log(this.items[i - 1]);
        }
    }
}
let pila = new Pila();

/* ----------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', function () {

    obtenerCSV()
    exportarCSV()
    botonHistorial()
    anteriorCancion()
    siguienteCanción()

});

/* ----------------------------------------------------------- */

function obtenerCSV() {
    // Se verifica el soporte del API FileReader
    if (!FileReader) {
        const error = new Error(`Este navegador no soporta el API FileReader`);
        alert(error.message);
        throw error;
    }

    // Se obtiene el elemento input para leer el archivo CSV
    const input = document.getElementById(`playlist`);

    // Se valida si el elemento existe
    if (input === null) {
        const error = new Error(`No se encuentra el ID: playlist`);
        alert(error.message);
        throw error;
    }

    // Callback para leer el archivo
    input.onchange = ev => {
        // Se verifica que se haya seleccionado el archivo
        const files = ev.target.files;

        if (!files.length) {
            console.info(`No se ha seleccionado ningún archivo`);
            return;
        }

        // Se inicia la lectura del archivo
        const reader = new FileReader();
        reader.readAsText(files[0]);

        // Lectura del contenido del archivo
        reader.onload = ev => {
            const csv = ev.target.result;
            const list = [];

            // Por cada linea
            csv.split(/\n/g).forEach((line, id) => {
                // Se ignora el encabezado
                if (id === 0) return;

                // Se estructura la informacion del video
                const prop = line.split(/;/g);

                list.push({
                    id,
                    /* type: prop[0] || null, */
                    title: prop[1] || null,
                    author: prop[2] || null,
                    /* genre: prop[3] || null, */
                    year: parseInt(prop[4]) || null,
                    path: prop[5] || null,
                });
            });

            reiniciarEstructuras()

            document.getElementById('botonExportar').classList.remove('ocultar')
            document.getElementById('export').classList.remove('noMostrar')
            document.getElementById('siguiente').classList.remove('noMostrar')

            list.forEach(element => {
                /* if (confirm(`Quieres elegir este ${element.type} para reproducir?\n${element.id}: ${element.title}`)) {
                } */
                fila.push(element);
            });
            /* fila.print() */
            var reproduciendo = fila

            if (fila.length !== 0) {
                // Se reproduce el elemento de la lista
                crearReproductor(reproduciendo[0]);
            } else {
                alert('No hay archivos para reproducir')
            }

            const tabla = document.getElementById('reproduccion')

            while (tabla.firstChild) {
                tabla.removeChild(tabla.firstChild);
            }

            const header = document.createElement('thead')
            tabla.appendChild(header)

            const array = [`ID`, `Título`, `Autor`, `Año`]
            array.forEach(title => {
                const head = document.createElement('th')
                head.textContent = title;

                header.appendChild(head);
            });

            const body = document.createElement(`tbody`);
            body.id = 'cuerpoLista'
            tabla.appendChild(body);

            for (let i = 0; i < reproduciendo.length; i++) {
                reproduciendo[i].id = i + 1
            }

            reproduciendo.forEach(entry => {
                const row = document.createElement(`tr`);
                body.appendChild(row);

                for (const propiedad in entry) {
                    if (propiedad !== 'path') {
                        const cell = document.createElement(`td`);
                        cell.textContent = entry[propiedad];
                        row.appendChild(cell);
                    }
                }
            });
        }
        // Callback de error de lectura
        reader.onerror = ev => {
            console.error(ev);
        }
    };
}

/* ----------------------------------------------------------- */

function eliminarArchivo() {
    if (fila.length !== 0) {
        pila.push(fila.shift());
    } else {
        alert('No hay más archivos para eliminar, la PlayList ya se reprodució toda');
    }
}

/* ----------------------------------------------------------- */

function exportarCSV() {
    // Se obtiene el botón para exportar el archivo CSV
    const output = document.getElementById(`export`);

    // Se valida si el elemento existe
    if (output === null) {
        const error = new Error(`No se encuentra el ID: export`);
        alert(error.message);
        throw error;
    }

    // Callback para exportar el archivo
    output.onclick = () => {
        // Se verifica el tamaño de la fila
        const newPlaylist = []
        reproduciendo.forEach(CSV => {
            newPlaylist.push(CSV)
        });

        if (newPlaylist.length === 0) {
            alert(`La fila está vacía`);
            return;
        }
        /* console.log(newPlaylist); */

        // Inicialización del contenido del archivo CSV sólo con el encabezado
        let csv = `data:text/csv;charset=utf-8,type;title;author;genre;year;path`;

        // Para cada item de la fila
        newPlaylist.forEach(item => {
            csv += `\r\n${item.type || ``};`;
            csv += `${item.title || ``};`;
            csv += `${item.author || ``};`;
            csv += `${item.genre || ``};`;
            csv += `${item.year || ``};`;
            csv += `${item.path || ``};`;
        });

        // Se codifica el contenido del archivo
        const content = encodeURI(csv);

        // Se crea un elemento anchor para escargar el archivo CSV
        const anchor = document.createElement(`a`);
        anchor.setAttribute(`href`, content);
        anchor.setAttribute(`download`, `reproduciendo.csv`);

        // Se dispara el evento click para iniciar la descarga del archivo
        anchor.click();

        eliminarElementos()
        reiniciarEstructuras()

        document.getElementById('botonExportar').classList.add('ocultar')
    }
}

/* ----------------------------------------------------------- */

// Configura el reproductor para el elemento indicado
function crearReproductor(element) {
    // Reiniciar reproductor
    const player = document.getElementById(`player`);

    if (typeof medio !== "undefined") {
        medio.remove()
    }

    // Configura el reproductor con el elemento actual
    const media = document.createElement('audio');
    media.setAttribute(`controls`, ``);
    media.setAttribute(`autoplay`, ``);
    media.id = 'medio'
    media.classList.add('audio')

    const source = document.createElement(`source`);
    source.setAttribute(`src`, element.path);
    source.setAttribute(`type`, `audio/mp3`);

    // Agrega el elemento al reproductor
    media.appendChild(source);
    player.appendChild(media);

    
    if (fila.length == 1) {
        document.getElementById('siguiente').classList.add('noMostrar')
    }
    
    medio = document.getElementById('medio')
    medio.addEventListener('ended', function () {
        eliminarArchivo()
        const lista = document.getElementById('cuerpoLista')
        lista.removeChild(lista.firstChild)
        document.getElementById('anterior').classList.remove('noMostrar')

        if (fila.length !== 0) {
            crearReproductor(fila[0]);
        } else {
            alert('No hay archivos para reproducir')

            eliminarElementos()

            if (confirm(`Desea ver el historial de reproducción en consola?`)) {
                if (pila.isEmpty()) {
                    alert('No hay archivos reproducidos hasta el momento')
                } else {
                    console.clear()
                    console.log('Historial de reproducción:\n\n')
                    pila.printPila()
                }
            }
        }
    })
};

/* ----------------------------------------------------------- */

function siguienteCanción() {
    siguiente = document.getElementById('siguiente')
    siguiente.addEventListener('click', function () {
        eliminarArchivo()
        const lista = document.getElementById('cuerpoLista')
        lista.removeChild(lista.firstChild)
        document.getElementById('anterior').classList.remove('noMostrar')

        if (fila.length !== 0) {
            crearReproductor(fila[0]);
        }
    })
}

/* ----------------------------------------------------------- */

function anteriorCancion() {
    anterior = document.getElementById('anterior')
    anterior.addEventListener('click', function () {
        const body = document.getElementById('cuerpoLista')
        row = document.createElement(`tr`);
        body.insertAdjacentElement('afterbegin', row);

        for (const propiedad in pila.peek()) {
            if (propiedad !== 'path') {
                const cell = document.createElement(`td`);
                cell.textContent = pila.peek()[propiedad];
                row.appendChild(cell);
            }
        }

        if (fila.length !== 0) {
            fila.unshift(pila.peek())
            crearReproductor(pila.popPila());
            if (pila.isEmpty()) {
                document.getElementById('anterior').classList.add('noMostrar')
            }
        }

        if (fila.length > 1) {
            document.getElementById('siguiente').classList.remove('noMostrar')
        }
    });
}

/* ----------------------------------------------------------- */

function botonHistorial() {
    document.getElementById('historial').onclick = function () {
        if (pila.isEmpty()) {
            alert('No hay archivos reproducidos hasta el momento')
        } else {
            console.clear()
            console.log('Historial de reproducción:\n\n')
            pila.printPila()
            alert('Puedes ver el historial en la consola')
        }
    }
}

/* ----------------------------------------------------------- */

function reiniciarEstructuras() {
    fila = []
    pila = new Pila();
}

/* ----------------------------------------------------------- */

function eliminarElementos() {
    const tabla = document.getElementById('reproduccion')
    tabla.removeChild(tabla.firstChild);
    document.getElementById('cuerpoLista').remove()
    document.getElementById('medio').remove()
    document.getElementById('export').classList.add('noMostrar')
    document.getElementById('anterior').classList.add('noMostrar')
    document.getElementById('siguiente').classList.add('noMostrar')
}