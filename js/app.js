/*
Author: Jerry Bai
Author URI: https://github.com/baistander
*/

var pz = {};

(function(window, undefined){
	var $ = jQuery,
		screen,
		screenWidth = jQuery('#play-stage').width(),
		screenHeight =jQuery('#play-stage').height(),
		screenTexts = {},
		civilianCount = 20,
		civilianSpeed = 1.25,
		civilians = [],
		zombieCount = 5,
		zombieSpeed = 2,
		zombieWanderFreq = 50,
		zombies = [],
		zombieExplosions = [],
		mathrandom = Math.random,
		mathfloor = Math.floor,
		mathsqrt = Math.sqrt,
		mathround = Math.round,
		mathcos = Math.cos,
		mathsin = Math.sin,
		mathpi = Math.PI,
		fps = 30,
		playTimer,
		player = {},
		playerSpeed = 3,
		playerRange = 75,
		playerCooldown = 4,
		playerKeys = [],
		gameOver = false,
		highScore = 0,
		testFrameByFrame = false,
		testFps = true;
	
	pz.init = function(){
		screen = Raphael('play-stage', '100%', '100%');
		
		highScore = localStorage.getItem('highScore');
		highScore = ((!highScore) ? 0 : highScore);
		
		pz.screen.draw();
		pz.player.createWeapon();
		pz.player.init();
		pz.civilians.init();
		pz.zombies.init();
		pz.explosions.init();
		pz.screen.initTexts();
		
		$(window).on({
			keydown : pz.player.keydown,
			keyup : pz.player.keyup
		});
		
		if(testFrameByFrame){
			$(window).on('click', pz.play);
		}
		
		pz.play();
		gameOver = false;
	};
	
	pz.gameOver = function(bool){
		var score, message;
		
		if(bool){
			score = civilians.length;
			highScore = ((score > highScore) ? score : highScore);
			localStorage.setItem('highScore', highScore);
			pz.screen.updateScore();
			
			message = 'You\'ve saved ' + score + ' civilian' + ((score) > 1 ? 's' : '') + '... not bad.';
		}
		else{
			message = 'Zombies made a snack out of you!';
		}
		
		bootbox.confirm(message, "Stay on the page", "New Game", function(result) {
		    if (result) {
		        location.reload(true);
		    }
		});
		
		gameOver = true;
	};
	
	pz.screen = {
		draw : function(){
			var bkgd, line, i, x, y;
			
			bkgd = screen.rect(0, 0, screenWidth, screenHeight);
			bkgd.attr('fill', '#000');
			
			for(i=0; i<screenWidth / 10; i++){
				x = (i*10+.5);
				line = screen.path('M' + x + ' 0 L' + x + ' ' + screenHeight);
				line.attr({
					'stroke-width': '1',
					'stroke': '#21331D'
				});
			}
			
			for(i=0; i<screenHeight / 10; i++){
				y = (i*10+.5);
				line = screen.path('M0 ' + y + ' L' + screenWidth + ' ' + y);
				line.attr({
					'stroke-width': '1',
					'stroke': '#21331D'
				});
			}
		},
		initTexts : function(){			
			screenTexts.zombies = screen.text(screenWidth-10, 10, 'zombies: ' + zombieCount);
			screenTexts.zombies.attr({
				'fill': '#fff',
				'font': '9px Arial',
				'text-anchor': 'end'
			});
			
			screenTexts.civilians = screen.text(screenWidth-10, 23, 'civilians: ' + civilianCount);
			screenTexts.civilians.attr({
				'fill': '#fff',
				'font': '9px Arial',
				'text-anchor': 'end'
			});
			
			screenTexts.highScore = screen.text(screenWidth-10, 36, 'high score: ' + highScore);
			screenTexts.highScore.attr({
				'fill': '#fff',
				'font': '9px Arial',
				'text-anchor': 'end'
			});
			
			screenTexts.fps = screen.text(screenWidth-46.5, 49, '');
			screenTexts.fps.attr({
				'fill': '#fff',
				'font': '9px Arial',
				'text-anchor': 'start'
			});
		},
		updateTexts : function(){
			screenTexts.zombies.attr('text', 'zombies: ' + zombies.length);
			screenTexts.civilians.attr('text', 'civilians: ' + civilians.length);
		},
		updateScore : function(){
			screenTexts.highScore.attr('text', 'high score: ' + highScore);
		}
	};
	
	pz.player = {
		init : function(){
			var plr = screen.circle(240, 160, 4);
			plr.attr({
				'fill': '#0085FF',
				'stroke-width': '5',
				'stroke': '#0085FF',
				'stroke-opacity': '.6'
			});
			plr.type = 'player';
			civilians.push(plr);
			
			player.obj = plr;
			player.coolDown = playerCooldown;
			player.diagSpeed = mathsqrt(playerSpeed * playerSpeed * .5);
		},
		createWeapon : function(){
			var weapon1, weapon2;
			
			weapon1 = screen.path('M0 0 L0 0');
			weapon1.attr({
				'stroke-width': '2',
				'stroke': '#0085FF',
				'opacity': '0'
			});
			weapon2 = screen.path('M0 0 L0 0');
			weapon2.attr({
				'stroke-width': '2',
				'stroke': '#0085FF',
				'opacity': '0'
			});
			
			player.weapon1 = weapon1;
			player.weapon2 = weapon2;
			player.weaponIndex = 1;
			player.weaponType = 1;
		},
		changeWeapon : function(){
			player.weaponType = player.weaponType % 2 + 1;
			
			if(player.weaponType == 1){
				player.weapon1.attr('stroke', '#0085FF');
				player.weapon2.attr('stroke', '#0085FF');
			}
			else{
				player.weapon1.attr('stroke', '#30BF89');
				player.weapon2.attr('stroke', '#30BF89');
			}
		},
		shoot : function(){
			var weapon, plrX, plrY, zomb, zombX, zombY, distance, nearest, i;
			
			player.coolDown += -1;
			
			for(i=1; i<=2; i++){
				weapon = player['weapon' + i];
				
				if(weapon.attr('opacity') > 0){
					plrX = player.obj.attr('cx');
					plrY = player.obj.attr('cy');
					
					weapon.attr({
						'path': 'M' + plrX + ' ' + plrY + ' L' + weapon.zombX + ' ' + weapon.zombY,
						'opacity': weapon.attr('opacity') - .15
					});
				}
			}
			
			if(zombies.length == 0 || player.isZombie || player.coolDown > 0){
				return;
			}
			
			nearest = {
				dist : 1000
			};
			
			plrX = player.obj.attr('cx');
			plrY = player.obj.attr('cy');
			
			for(i=0; i<zombies.length; i++){
				zomb = zombies[i];
				zombX = zomb.attr('x');
				zombY = zomb.attr('y');
				distance = pz.math.pyth(plrX - zombX, plrY - zombY);
				if(distance < nearest.dist){
					nearest = {
						index : i,
						x : zombX + 2,
						y : zombY + 2,
						dist : distance,
						type : zomb.type
					};
				}
			}
			
			if(nearest.dist <= playerRange){
				weapon = player['weapon' + player.weaponIndex];
				player.weaponIndex = (player.weaponIndex == 1 ? 2 : 1);
				
				weapon.zombX = nearest.x;
				weapon.zombY = nearest.y;
				weapon.attr({
					'path': 'M' + plrX + ' ' + plrY + ' L' + nearest.x + ' ' + nearest.y,
					'opacity': '1'
				});
				if(!zombies[nearest.index].hitPoints){
					zomb = zombies.splice(nearest.index, 1)[0];
					
					if(player.weaponType == 1){
						zomb.attr('opacity', '0');
						pz.explosions.explode(nearest.x, nearest.y, nearest.type);
					}
					else{
						zomb.attr({
							'fill': '#53FF00',
							'stroke': '#53FF00'
						});
						zomb.zombies = [];
						zomb.timeToWander = 0;
						civilians.push(zomb);
					}
					
				}
				else{
					zombies[nearest.index].hitPoints += -1;
				}
				
				player.coolDown = playerCooldown;
			}
		},
		keydown : function(event){
			if(event.keyCode == '32'){
				pz.player.changeWeapon();
			}
			else{
				playerKeys[event.keyCode] = true;
			}
		},
		keyup : function(event){
			playerKeys[event.keyCode] = false;
		},
		move : function(){
			var x=0, y=0, dx, dy, diagSpeed;
			
			if(playerKeys[37] && !playerKeys[39]){
				x = -playerSpeed;
			}
			else if(!playerKeys[37] && playerKeys[39]){
				x = playerSpeed;
			}
			if(playerKeys[38] && !playerKeys[40]){
				y = -playerSpeed;
			}
			else if(!playerKeys[38] && playerKeys[40]){
				y = playerSpeed;
			}
			
			if(x != 0 && y != 0){
				diagSpeed = player.diagSpeed;
				x = (x > 0 ? diagSpeed : -diagSpeed);
				y = (y > 0 ? diagSpeed : -diagSpeed);
			}
			
			if(x != 0 || y != 0){
				dx = player.obj.attr('cx') + x;
				dy = player.obj.attr('cy') + y;
				dx = (dx < 1 ? 1 : (dx > screenWidth-7 ? screenWidth-7 : dx));
				dy = (dy < 0 ? 0 : (dy > screenHeight-6 ? screenHeight-6 : dy));
				
				player.obj.attr({
					'cx': dx,
					'cy': dy
				});
			}
		}
	};
	
	pz.civilians = {
		init : function(){
			var civ, i;
			
			for(i=0; i<civilianCount; i++){
				civ = screen.rect(mathfloor(mathrandom() * screenWidth), mathfloor(mathrandom() * screenHeight), 5, 5);
				civ.attr({
					'fill': '#53FF00',
					'stroke-width': '3.5',
					'stroke': '#53FF00',
					'stroke-opacity': '.5'
				});
				civ.zombies = [];
				civilians.push(civ);
			}
		},
		move : function(){
			var civ, civX, civY, zomb, zombX, zombY, distance, nearest, ratio, i, j;
			
			for(i=0; i<civilians.length; i++){
				if(zombies.length == 0 && !gameOver){
					pz.gameOver(true);
				}
			
				civ = civilians[i];
				civX = civ.attr('x');
				civY = civ.attr('y');
				
				if(civ.type == 'player'){
					continue;
				}
				
				nearest = {
					dist : 1000
				};
				
				for(j=0; j<civ.zombies.length; j++){
					zomb = zombies[j];
					zombX = zomb.attr('x');
					zombY = zomb.attr('y');
					distance = pz.math.pyth(civX - zombX, civY - zombY);
					if(distance < nearest.dist){
						nearest = {
							x : zombX,
							y : zombY,
							dist : distance
						};
					}
				}
				
				if(nearest.x){
					ratio = ((nearest.dist > 0) ? civilianSpeed / nearest.dist : 0);
					civX = civX - ratio * (nearest.x - civX);
					civY = civY - ratio * (nearest.y - civY);
					
					civ.zombies = [];
				}
				else{
					if(!civ.timeToWander){
						var dir = mathpi * mathrandom() * 2;
						civ.wanderDir = {
							x : civilianSpeed * mathcos(dir),
							y : civilianSpeed *  mathsin(dir)
						};
						civ.timeToWander = 15;
					}
					else{
						civ.timeToWander += -1;
					}
					
					civX = civX + civ.wanderDir.x;
					civY = civY + civ.wanderDir.y;
				}
				
				civX = (civX < 1 ? 1 : (civX > screenWidth-7 ? screenWidth-7 : civX));
				civY = (civY < 0 ? 0 : (civY > screenHeight-6 ? screenHeight-6 : civY));
				
				civ.attr({
					'x': civX,
					'y': civY
				});
			}
		}
	};
	
	pz.zombies = {
		init : function(){
			var zomb, i;

			for(i=0; i<zombieCount; i++){
				zomb = screen.rect(mathfloor(mathrandom() * screenWidth), mathfloor(mathrandom() * screenHeight), 5, 5);
				zomb.attr({
					'fill': '#F80F00',
					'stroke-width': '3.5',
					'stroke': '#F80F00',
					'stroke-opacity': '.5'
				});
				zomb.speed = zombieSpeed;
				zomb.timeToWander = mathfloor(mathrandom() * zombieWanderFreq);
				zombies.push(zomb);
			}
		},
		move : function(){
			var zomb, zombX, zombY, civ, civX, civY, distance, distX, distY, nearest, ratio, i, j, rand;
				
			for(i=0; i<zombies.length; i++){
				zomb = zombies[i];
				zombX = zomb.attr('x');
				zombY = zomb.attr('y');
				
				if(zomb.timeToWander > 15 && civilians.length > 0){
					nearest = {
						dist : 1000,
						civ : {}
					};
					
					for(j=0; j<civilians.length; j++){
						civ = civilians[j];
						civX = (civ.type != 'player' ? civ.attr('x') : civ.attr('cx'));
						civY = (civ.type != 'player' ? civ.attr('y') : civ.attr('cy'));
						distX = civX - zombX;
						distY = civY - zombY;
						distance = pz.math.pyth(distX, distY);
						if(distance < nearest.dist){
							nearest = {
								index : j,
								civ : civ,
								x : civX,
								y : civY,
								dist : distance,
								distX : distX,
								distY : distY
							};
							zomb.nearest = nearest;
						}
					}
					
					if(nearest.civ.type && nearest.civ.type != 'player'){
						nearest.civ.zombies.push(zomb);
					}
					
					if(nearest.dist > zomb.speed){
						ratio = zomb.speed / nearest.dist;
						zomb.attr({
							'x': zombX + ratio * (nearest.distX),
							'y': zombY + ratio * (nearest.distY)
						});
					}
					else{
						zomb.attr({
							'x': nearest.x,
							'y': nearest.y
						});
						
						//eat civilian
						civ = civilians.splice(nearest.index, 1)[0];
						civ.eaten = ((typeof civ.eaten === 'undefined') ? 1 : civ.eaten + 1);
						
						//if civilian's been eaten 3 or more times, it evolves into a shadow zombie
						if(civ.eaten < 3 && zomb.type != 'shadow'){
							civ.attr({
								'fill': '#F80F00',
								'stroke': '#F80F00'
							});
							civ.speed = zombieSpeed;
						}
						else{
							civ.attr({
								'fill': '#4F1413',
								'stroke': '#4F1413'
							});
							civ.speed = zombieSpeed * 1.5;
							civ.type = ((civ.type != 'player') ? 'shadow' : civ.type);
						}
							
						civ.timeToWander = zombieWanderFreq;
						zombies.push(civ);
						
						if(civ.type == 'player'){
							player.isZombie = true;
							pz.gameOver(false);
						}
					}
				}
				else{
					if(!zomb.wanderDir){
						var dir = mathpi * mathrandom() * (zomb.nearest ? .5 : 2);
						zomb.wanderDir = {
							x : zomb.speed * (zomb.nearest && zomb.nearest.distX < 0 ? -mathcos(dir) : mathcos(dir)),
							y : zomb.speed * (zomb.nearest && zomb.nearest.distY < 0 ? -mathsin(dir) : mathsin(dir))
						};
					}
					
					zombX = zombX + zomb.wanderDir.x;
					zombY = zombY + zomb.wanderDir.y;
					zomb.wanderDir.x = (zombX < 1 || zombX > screenWidth - 7 ? -zomb.wanderDir.x : zomb.wanderDir.x);
					zomb.wanderDir.y = (zombY < 0 || zombY > screenHeight - 6 ? -zomb.wanderDir.y : zomb.wanderDir.y);

					zomb.attr({
						'x': zombX,
						'y': zombY
					});
					
					if(zomb.timeToWander <= 0){
						zomb.timeToWander = zombieWanderFreq;
						
						if(civilians.length > 0){
							zomb.wanderDir = undefined;
						}
					}
				}
				
				zomb.timeToWander += -1;
			}
		}
	};
	
	pz.explosions = {
		init : function(){
			var explosion, explosionBit, i, j, k;
			
			for(i=0; i<5; i++){
				explosion = [];
				for(j=0; j<3; j++){
					for(k=0; k<3; k++){
						explosionBit = screen.rect(0, 0, 3, 3);
						explosionBit.attr('fill', '#F80F00');
						explosionBit.attr('opacity', '0');
						explosionBit.attr('stroke-width', '0');
						explosion.push(explosionBit);
					}
				}
				
				zombieExplosions.push({explosion:explosion, count:0});
			}
		},
		explode : function(x, y, type){
			var explosion, bit, index, i, j, k;
			
			for(i=0; i<zombieExplosions.length; i++){
				explosion = zombieExplosions[i];
				if(explosion.count == 0){
					explosion.count = 6;
					
					index = 0;
					for(j=-1; j<=1; j++){
						for(k=-1; k<=1; k++){
							bit = explosion.explosion[index];
							bit.attr({
								'x': x + j*3,
								'y': y + k*3,
								'fill': ((type == 'shadow') ? '#A74A48' : '#F80F00'),
								'opacity': '1'
							});
														
							index++;
						}
					}
					
					return;
				}
			}
		},
		animate : function(){
			var explosion, bit, index, i, j, k;
			
			for(i=0; i<zombieExplosions.length; i++){
				explosion = zombieExplosions[i];
				if(explosion.count > 0){
					explosion.count += -1;
					
					index = 0;
					for(j=-1; j<=1; j++){
						for(k=-1; k<=1; k++){
							bit = explosion.explosion[index];
							
							if(explosion.count > 0){
								bit.attr('x', bit.attr('x') + j*.4);
								bit.attr('y', bit.attr('y') + k*.4);
								bit.attr('opacity', bit.attr('opacity') - .1);
							}
							else{
								bit.attr('opacity', '0');
							}
							
							index++;
						}
					}
				}
			}
		}
	};
	
	pz.play = function(){
		pz.player.move();
		pz.zombies.move();
		pz.civilians.move();
		pz.player.shoot();
		pz.explosions.animate();
		pz.screen.updateTexts();
		
		if(!testFrameByFrame){
			playTimer = setTimeout(pz.play, 1000 / fps);
		}
		
		if(testFps){
			if(!pz.prevTime){
				pz.prevTime = (new Date()).getTime();
				return;
			}
			
			var curTime = (new Date()).getTime();
			var dt = curTime - pz.prevTime;
			pz.prevTime = curTime;
			screenTexts.fps.attr('text', 'fps: ' + (mathround(10000/dt)/10));
		}
	};
	
	pz.math = {
		pyth : function(x, y){
			return mathsqrt(x * x + y * y);
		}
	};
	
	$(function(){
		pz.init();
	});
	
}(window));