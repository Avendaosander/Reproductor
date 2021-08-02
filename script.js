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

    leerArchivos()
    botonHistorial()
    anteriorCancion()
    siguienteCanción()

});

/* ----------------------------------------------------------- */

function leerArchivos() {

    const input = document.getElementById(`playlist`);

    if (input === null) {
        const error = new Error(`No se encuentra el ID: playlist`);
        alert(error.message);
        throw error;
    }

    input.onchange = ev => {

        const files = ev.target.files;

        if (!files.length) {
            console.info(`No se ha seleccionado ningún archivo`);
            return;
        }

        const list = []
        const append = (file, id, tags, reset) => {
            if (tags.type === `ID3`) {
                list.push({
                    id,
                    title: tags.tags.title || file.name,
                    author: tags.tags.artist || `Desconocido`,
                    genre: tags.tags.genre || `Desconocido`,
                    year: tags.tags.year || `Desconocido`,
                    src: URL.createObjectURL(file)
                });
            } else {
                console.error(`${file.name}: ${tags.info}`);
            }

            if (reset) {
                fila.forEach(({
                    src
                }) => {
                    URL.revokeObjectURL(src);
                });

                fila = []
                pila = new Pila();

                document.getElementById('tablaPadre').classList.remove('ocultar')
                document.getElementById('buttoms').classList.remove('ocultar')
                document.getElementById('siguiente').classList.remove('noMostrar')

                list.forEach(element => {
                    /* if (confirm(`Quieres elegir este ${element.type} para reproducir?\n${element.id}: ${element.title}`)) {
                    } */
                    fila.push(element);
                });
                var reproduciendo = fila

                if (fila.length !== 0) {
                    crearReproductor(reproduciendo[0]);
                } else {
                    alert('No hay archivos para reproducir!!!!')
                }

                const tabla = document.getElementById('reproduccion')

                while (tabla.firstChild) {
                    tabla.removeChild(tabla.firstChild);
                }

                const header = document.createElement('thead')
                tabla.appendChild(header)

                const array = [`ID`, `Título`, `Autor`, `Genero`, `Año`]
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
                        if (propiedad !== 'src') {
                            const cell = document.createElement(`td`);
                            cell.textContent = entry[propiedad];
                            row.appendChild(cell);
                        }
                    }
                });
            }
        }

        for (let i = 0; i < files.length; ++i) {
            const file = files[i];
            const id = i + 1;
            const reset = i === (files.length - 1);

            window.jsmediatags
                .read(file, {
                    onSuccess: tags => {
                        append(file, id, tags, reset);
                    },
                    onError: err => {
                        append(file, id, err, reset);
                    }
                });
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

function crearReproductor(element) {

    const player = document.getElementById(`player`);

    if (typeof medio !== "undefined") {
        medio.remove()
    }

    const media = document.createElement('audio');
    media.setAttribute(`controls`, ``);
    media.setAttribute(`autoplay`, ``);
    media.id = 'medio'
    media.classList.add('audio')

    const source = document.createElement(`source`);
    source.setAttribute(`src`, element.src);
    source.setAttribute(`type`, `audio/mpeg`);

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

            const tabla = document.getElementById('reproduccion')
            tabla.removeChild(tabla.firstChild);
            document.getElementById('cuerpoLista').remove()
            document.getElementById('medio').remove()
            document.getElementById('anterior').classList.add('noMostrar')
            document.getElementById('siguiente').classList.add('noMostrar')

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
            if (propiedad !== 'src') {
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