// import Bot from "./bot"

const tablero = document.getElementById('tablero')
const cuadrados = tablero.children
const botonContinuar = document.getElementById('boton')
botonContinuar.addEventListener('click',reiniciar,false)

let dificultad = 1
//1 = JUGADOR, 5 = BOT
let turno = 1
let finalizo = false

let matrizTablero = [
    [0,0,0],
    [0,0,0],
    [0,0,0]
]

const turnoFicha = {
    1 : 'cruz',
    5 : 'circulo'
}

const mensageFinal = {
    1 : 'El Ganador es el Jugador',
    5 : 'El Ganador es el Bot',
    3 : 'Empate'
}

for (let i = 0; i < cuadrados.length; i++) {
    if (cuadrados[i].id == 'cartel'){
        continue
    }
    cuadrados[i].addEventListener('click', eventoClick, false)
}

function cambiarTurno(){
    if (turno == 1){
        turno = 5
    }else{
        turno = 1
    }
}

function copiarMatriz(tablero){
    let clon = tablero.map(function(arr) {
        return arr.slice();
    });
    return clon
}


//Permite encontrar los subindices(matriz) de un cuadrado con su ID
function encontrarSubindices(id){
    let i =  Math.floor(id / matrizTablero.length)
    let j = id - (i * 3)
    
    return [i,j]
}

//Permite encontrar el ID de un cuadrdado a partir de sus subindices(matriz)
function encontrarId(posicion){
    let id = (posicion[0] * matrizTablero.length) + posicion[1]
    return id
}


//Esta funcion pone las fichas
function ponerFicha(cuadrado){
    
        cuadrado.classList.toggle(turnoFicha[turno])
        let indices = encontrarSubindices(cuadrado.id)
        matrizTablero[indices[0]][indices[1]] = turno
    
}


function sumarPuntuacion(jugador){
    if (jugador == 1){
        const puntuacion = document.getElementById('puntuacion-J1')
        let aux = parseInt(puntuacion.innerText)
        aux += 1
        puntuacion.innerText = aux
    }else{
        const puntuacion = document.getElementById('puntuacion-BOT')
        let aux = parseInt(puntuacion.innerText)
        aux += 1
        puntuacion.innerText = aux
    }
}

function comprobarGanador(estado){
    if (estado > 0){
        finalizo = true
        mostrarCartelFinal(estado)
        
        sumarPuntuacion(estado)
        
    }else if(estado == -1){
        finalizo = true
        mostrarCartelFinal(estado)
        
    }else{
        cambiarTurno()
    }
}

function comprobarPosicionOcupado(cuadrado){
    if (!cuadrado.classList.contains('cruz') && !cuadrado.classList.contains('circulo')){
        return false
    }else{
        return true
    }
}

function eventoClick(elemento){
    
    if (!finalizo && !comprobarPosicionOcupado(elemento.target)){
        ponerFicha(elemento.target)
        let estado = comprobarEstado(matrizTablero, turno)
        comprobarGanador(estado)
        
        if (!finalizo){
            turnoBot()
        }
        
        
    }
}


function turnoBot(){
        
    let posicion = calcularMovimiento(matrizTablero)
    let id = encontrarId(posicion)
    
    let elemento = document.getElementById(id)
    ponerFicha(elemento)
    let estado = comprobarEstado(matrizTablero, turno)
    comprobarGanador(estado)
        
    

}

//Comprueba quien gano, si fue enmapte o si todavia se puede seguir jugando
function comprobarEstado(matriz, turnoActual){
    let ganador = 0
    let posicionLibre = false
    for (let i = 0; i < matriz.length; i++) {
        let horizontal = 0
        let vertical = 0
        for (let j = 0; j < matriz.length; j++) {

            if(matriz[i][j] == 0){
                posicionLibre = true
            }

            horizontal += matriz[i][j]
            vertical += matriz[j][i]

        }

        if((vertical == 15 || vertical == 3) || (horizontal == 15 || horizontal == 3)){
            ganador = turnoActual
            break
        }
        
    }
    let diagonalPrincipal = matriz[0][0] + matriz[1][1] + matriz[2][2]
    let diagonalInvertida = matriz[0][2] + matriz[1][1] + matriz[2][0]

    if(diagonalPrincipal == 15 || diagonalPrincipal == 3){
        ganador = turnoActual
    }else if(diagonalInvertida == 15 || diagonalInvertida == 3){
        ganador = turnoActual
    }

    
    if(ganador == 0 && !posicionLibre){
        ganador = -1
    }

    return ganador
}

function limpiarTablero(){
    for (let i = 0; i < cuadrados.length; i++) {
        let cuadrado = cuadrados[i]
        let lista = cuadrado.classList 
        if (lista.contains('cruz') || lista.contains('circulo')){
            cuadrado.classList.toggle(lista[1])
        }
    }
}

function reiniciar(){

    let cartel = document.getElementById('cartel')
    cartel.style="display:none;"
    // setTimeout(() => {
    //     cartel.style="display:none;" 
    //   }, 1000);

    turno = 1
    finalizo = false
    matrizTablero = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ]

    limpiarTablero()
}

//Se encarga de obtener la puntuacion de un movimiento para el bot. Entre mayor el numero mejor es ese movimiento.
function calcularPuntuacion(tablero, turno, puntuacion, depth){
depth += 1
for (let i = 0; i < tablero.length; i++) {
    for (let j = 0; j < tablero.length; j++) {
        if (tablero[i][j] != 0){
            continue
        }

        let copia = copiarMatriz(tablero)
        if(turno == 1){
            copia[i][j] = 1
            let estado = comprobarEstado(copia, 1)
            if (estado == 1 && depth == 1){
                puntuacion -= 100
                return puntuacion
            }else if (estado == 1){
                puntuacion -= 1
                return puntuacion
            }else if(estado == -1){
                puntuacion += 1
                return puntuacion
            }
            puntuacion = calcularPuntuacion(copia, 5, puntuacion, depth)
        }else{
            copia[i][j] = 5
            let estado = comprobarEstado(copia, 5)
            if (estado == 5){
                puntuacion += 1
                return puntuacion
            }else if(estado == -1){
                puntuacion += 1
                return puntuacion
            }
            puntuacion = calcularPuntuacion(copia, 1, puntuacion, depth)
        }
        
    }
    
}
    return puntuacion
}

//Inicializa lo necesario , recorre las posiciones disponibles para que el bot haga un movimiento y retorna la posicion.
function calcularMovimiento(tablero){
    
    let puntuaciones = []
    
    for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero.length; j++) {
            let puntuacion = 0
            if(tablero[i][j] == 0){
                let copia = copiarMatriz(tablero)
                copia[i][j] = 5
                if(comprobarEstado(copia, 5) == 5){
                    puntuaciones.push({
                        posicion : [i,j],
                        puntos : 100
                    })
                    continue
                }
                puntuacion = calcularPuntuacion(copia, 1, puntuacion, 0)
                puntuaciones.push({
                    posicion : [i,j],
                    puntos : puntuacion
                })
            }
            
        }
        
    }

    let posicion
    let puntos = -10000
    puntuaciones.forEach(element => {
        if (element.puntos > puntos){
            posicion = element.posicion
            puntos = element.puntos
        }
    });

    return posicion
}


function mostrarCartelFinal(ganador){
    let cartel = document.getElementById("cartel")
    let mensaje = cartel.children[0]
    
    if (ganador == 1 || ganador == 5){
        mensaje.innerText = mensageFinal[ganador]
    }else{
        mensaje.innerText = mensageFinal[3]
    }

    cartel.style="display:flex;"

}