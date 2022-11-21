import React, { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Modal from 'react-bootstrap/Modal';
import { config } from './render/config';
import Phaser from 'phaser';

const playerActions = [
  {
    id: 'attack-1',
    label : 'Attaque 1',
    description : `Permet d’attaquer au corps à corps. Vous infligez 
    -2pv à l’adversaire sur une case adjacente (haut, bas, droite, gauche).`,
    image: '/interface/tooltips/infos-attaque1.png'
  },
  {
    id: 'attack-2',
    label : 'Attaque 2',
    description: `Permet d’attaquer à distance. Vous infligez -1pv à l’adversaire 
    sur une case en diagonale ou sur la 2eme en horizontal / verticale.`,
    image: '/interface/tooltips/infos-attaque2.png'
  },
  {
    id: 'defense',
    label : 'Defense',
    description: `Permet de réduire les dégâts subis de 1 à la prochaine 
    attaque que vous subissez.`,
    image: '/interface/tooltips/infos-defense.png'
  },
  {
    id: 'deplacement',
    label: 'Deplacement',
    description: 'Permet de se deplacement suivant le cout du mouvement, 3 deplacements autorisés par tour',
    image: '/interface/tooltips/infos-attaque1.png'
  }
]

const PlayerActionButton = (props : {config: any, separator?: boolean, setAction:Function}) => {
  return (
    <>
    <OverlayTrigger
      placement={'top'}
      trigger={'click'}
      overlay={
        <Tooltip className='game-tooltip-parent tooltip-top' style={{maxWidth : 'auto', marginBottom: '6px'}}>
          <div className="game-tooltip d-flex">
            {props.config.image && <div className="game-tooltip-image">
              <img src={props.config.image} />
            </div>}
            
            <div className="game-tooltip-message">
              {props.config.description}
            </div>
          </div>
        </Tooltip>
      }
    >
      {({ ref, ...triggerHandler }) => (
        <Button onClick={() => props.setAction(props.config.id)}>{props.config.label} <i className="fa-solid fa-circle-info text-white ms-1" {...triggerHandler} ref={ref}></i></Button> 
      )}
     
    </OverlayTrigger> {props.separator ? '/' : ''}
   </>
  );
}

function App(props: { roomAccessToken : string}) {
  const [offset, setOffset] = useState(0);
  const [entities, setEntities] = useState<any[]>([]);
  const controlButton = useCallback((direction : number) => {
    if (direction === 1 && offset + 10 + 1 <= entities.length) setOffset(offset + 1);
    else if (direction === -1 && offset - 1 >= 0) setOffset(offset - 1); 
  }, [offset]);
  const gameContainer = useRef(); 
  const [waitingModal, setWaitingModal] = useState(true);
  const [phaserGame, setPhaserGame] = useState<undefined | Phaser.Game>(undefined);
  const [ready, setReady] = useState(false);
  const [willStartModal, setWillStartModal] = useState(false);
  const [team, setTeam] = useState('spectator');
  const [timer, setTimer] = useState(0);
  const [action, setAction] = useState('deplacement');
  const [actions, setActions] = useState<string[]>([]);
  const [entityTurn, setEntityTurn] = useState<undefined | any>(undefined);
  const [socket, setSocket] = useState<undefined | WebSocket>(undefined);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner,setWinner] = useState<string>('');

  useEffect(() => {
    if (actions.indexOf(action) === -1 && entityTurn?.team === team) {
      handleAction(actions[0]);
    }
  }, [actions, action, entityTurn, team]);


  useEffect(() => {
    if (gameContainer && gameContainer.current) {
      const game = new Phaser.Game(config);
      game.canvas.style.display = 'none';
      
     console.log('register-event');
      game.events.once('assets-ready', () => {
        game.canvas.style.display = 'block';
        setPhaserGame(game);
        setReady(true);
        document.querySelector('.game-canvas')?.appendChild(game.canvas);
      })
      console.log('register event end');
   
      return () => {
        game?.destroy(true);
      }
    }
  }, [gameContainer])

  useEffect(() => {
    if (phaserGame) {
      const socket = new WebSocket(import.meta.env.VITE_SOCKET_API);
      setSocket(socket);
      let entitiesRaw : any[] = [];
      socket.onopen = () => {
        socket.send(JSON.stringify({
          id : 'room-join',
          token: props.roomAccessToken
        }));
      }
      socket.addEventListener('message', (e) => {
        const data = JSON.parse(e.data);
        if (data.id === 'room-state') {
          
          if (data.state === 'will-start') {
            setTeam(data.role);
            setTimer(data.timer);
            setWillStartModal(true);
            setWaitingModal(false);
          } else if (data.state === 'running') {
            setEntityTurn(data.entityTurn);
            setEntities(data.entities);
            setActions(data.entityTurn.actions);

            entitiesRaw = data.entities;
            phaserGame.events.emit('game-state', data);
            

            setWillStartModal(false);
            setWaitingModal(false);
          } else if (data.state === 'waiting') {
            setWillStartModal(false);
            setWaitingModal(true);
            setTeam('spectator');
            phaserGame.events.emit('game-reset');
          } else if (data.state === 'game-over') {
            setGameOver(true);
            setWinner(data.winner);
            setWaitingModal(false);
          }else {
            setWillStartModal(false);
            setWaitingModal(false);
          }
        }

        if (data.id === 'timer') {
          setTimer(data.timer);
        }
  
        if (data.id === 'turn-change') {
          setAction('deplacement');
          setEntityTurn(data.entityTurn);
          setActions(data.entityTurn.actions);
         
        }

        if (data.id === 'turn-entities') {
          setEntities(data.entities);
          entitiesRaw = data.entities;
          phaserGame.events.emit('game-entities', data.entities);
        }
  
        if (data.id === 'ping') {
          socket.send(JSON.stringify({ id : 'pong'}))
        }
        if (data.id === 'turn-update') {
          setActions(data.entity.actions);
          const entity : any = data.entity;
          const formatedEntities = entitiesRaw.map(e => {
            if (e.id !== entity.id) return e;
            if (data.action.includes('attack')) {
              if (data.target && data.target.id === entity.id) return data.target;
            }
            return entity;
          });
          setEntities(formatedEntities);
          entitiesRaw = formatedEntities;
          setEntityTurn(entity);
          if (entity) {
            setAction(data.entity.currentAction);
          }
          if (data.action === 'attack-2') {
            const formatedEntities = entitiesRaw.map(e => {
              if (e.id !== data.target.id) return e;
              return data.target;
            });
            entitiesRaw = formatedEntities;
            setEntities(entitiesRaw);
          }
          phaserGame.events.emit('turn-update', data);
        }
      })

      const onCellAction = (x : number, y : number, action: string) => {
        socket.send(JSON.stringify({
          id : 'cell-action',
          x, 
          y,
          action
        }));
      };

      phaserGame.events.on('cell-action', onCellAction);
      return () => {
        phaserGame.events.off('cell-action', onCellAction);
        socket.close();
      }
    }
   
  }, [phaserGame]);

  useEffect(() => {
    if (phaserGame) {
      phaserGame.events.emit('game-team', team);
      phaserGame.events.emit('game-turn', entityTurn);
    }
  }, [team, phaserGame, entityTurn]);

  const handleAction = useCallback((actionName : string) => {
    
    if (socket && socket.readyState === socket.OPEN) {
     
      if (entityTurn && entityTurn.team === team && entityTurn.currentAction !== actionName) {
        socket.send(JSON.stringify({
          id : 'cell-action',
          action: 'action-switch',
          name: actionName
        }));
        
     
      }
    }
  }, [team, entityTurn, action, socket]);

  const handleStopTimer = useCallback(() => {
    if (socket && socket.readyState === socket.OPEN) {
      if (entityTurn && entityTurn.team === team) {
        socket.send(JSON.stringify({
          id : 'cell-action',
          action: 'stop-turn'
        }));
      }
    }
  }, [socket, team, entityTurn]);

  const availableActions = playerActions.filter(a => a.id !== action && actions.indexOf(a.id) !== -1);

  return (
    <div className="game bg-dark position-relative" ref={gameContainer as any}>
      <div className="game-header d-flex" style={{ overflow : 'hidden', borderTopRightRadius : '0.375rem', borderTopLeftRadius : '0.375rem'}}>
        <div className="btn-group col-12 position-relative" style={ { height : '40px' }}>
          <button 
            type="button" 
            className="btn btn-dark position-absolute" 
            onClick={() => controlButton(-1)} 
            disabled={offset - 1 < 0} 
            style={{ width : '60px'}}
          >
            <i className="fa-solid fa-left-long"></i>
          </button>
          <ul className='d-flex m-0 p-0 position-absolute' style={{ left : '65px', width: 'calc(100% - 120px)'}}>
            
            {entities.slice(offset, 10 + offset).map((e, i) => {
              const borderColor = e.team === 'civilian' ? 'brown' : e.team === 'police' ? 'skyblue' : 'purple';
              return <li key={e.id} style={{
                marginRight: i === 9 ? '0px' : '4.444px',
                border: e.id !== entityTurn.id ? '4px solid var(--bs-gray-700)' : '4px solid ' + borderColor,
                opacity : e.id !== entityTurn.id ? '0.6' : '1'
              }}>
                <div className="perso-avatar">
                 <img src={"/interface/persos/" + e.avatar + '.svg'} height={e.avatar !== 'virus' ? 60 : 25} />
                </div>
                {e.defense && <img src="/interface/tooltips/icone-defense.svg" alt="defense" className="defense" />}
              </li>
            })}
          </ul>
          <button 
            type="button" 
            className="btn btn-dark position-absolute end-0" 
            onClick={() => controlButton(1)} 
            disabled={offset + 10 + 1 > entities.length} 
            style={{ width : '60px'}}
          >
            
              <i className="fa-solid fa-right-long"></i>  
          </button>        
        </div>
      </div>
      <div className="game-canvas col-12">

      </div>
      <div className="game-footer">
        <div className="game-player-turn">
          <p>Tour de: <span>
            {entityTurn ? entityTurn.name : '-'}
            </span></p>
        </div>
        <div className="game-player-movements">
          <p>Movements : <span>{entityTurn?.movement ?? 0}/3</span></p>
        </div>
        <div className="game-player-actions">
          <p>
            Actions :
            {availableActions.map((actionConfig, id) => <PlayerActionButton setAction={handleAction} config={actionConfig} key={id} separator={id + 1 !== availableActions.length} />)}
          </p>
        </div>
        <div className="game-timer">
          <p>TEMPS : <span className='timer'>{timer < 10 ? '0' + timer : timer}sc </span> - <PlayerActionButton setAction={(v : any) => {
            handleStopTimer();
          }} config={{label : 'STOP', description : `En cliquant dessus vous terminez votre tour afin de passer au personnage suivant.`}}/></p>
        </div>
      </div>
      
      {ready && (<Modal show={willStartModal} container={gameContainer.current as any} centered={true} >
        <Modal.Body className={team}>
          <h3>EQUIPE - {team[0].toUpperCase() + team.slice(1, team.length)}</h3>
          <p>Début de la partie dans : {timer}sc</p>
          <div className='notice'>
          <p className="notice">
            Regardez bien qui commence en haut à gauche
          </p>
          </div>
        </Modal.Body>
      </Modal>) }
      {gameOver && (<Modal show={gameOver} container={gameContainer.current as any} centered={true}>
        <Modal.Body className={"game-over-modal " + winner}>
          <h3>VAINQUEUR : {winner === 'police' ? 'Police' : 'Citoyen'}</h3>
          <p>Joueur vaincu : {winner === 'police' ? 'Citoyen' : 'Police'}</p>
          <div className='notice'>
          <p className="notice">
            Regardez bien qui commence en haut à gauche
          </p>
          </div>
        </Modal.Body>
      </Modal>)}
      {waitingModal && phaserGame && (<Modal show={waitingModal} container={gameContainer.current as any} centered={true}>
        <Modal.Body>
          <h3 style={{ color: 'white' }}>En attente de l'adversaire...</h3>
          
        </Modal.Body>
      </Modal>)}
  </div>
  )
}

export default App
