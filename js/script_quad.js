/* Author:

*/

var pz = {};

(function(window, undefined){
	var $ = jQuery,
		screen,
		screenWidth = 480,
		screenHeight = 320,
		civilianCount = 100,
		civilianSpeed = 1,
		civilianTree = [],
		zombieCount = 50,
		zombieSpeed = 2,
		zombieTree = [],
		mathrandom = Math.random,
		mathfloor = Math.floor,
		fps = 30,
		playTimer;
	
	pz.init = function(){
		screen = Raphael(0, 0, 480, 320);
		
		pz.screen.draw();
		pz.civilians.init();
		pz.zombies.init();
		
		pz.play();
	};
	
	pz.screen = {
		draw : function(){
			var bkgd, line, i, x, y;
			
			bkgd = screen.rect(0, 0, screenWidth, screenHeight);
			bkgd.attr('fill', '#000');
			
			for(i=0; i<screenWidth / 10; i++){
				x = (i*10+.5);
				line = screen.path('M' + x + ' 0 L' + x + ' ' + screenHeight);
				line.attr('stroke-width', '1');
				line.attr('stroke', '#21331D');
			}
			
			for(i=0; i<screenHeight / 10; i++){
				y = (i*10+.5);
				line = screen.path('M0 ' + y + ' L' + screenWidth + ' ' + y);
				line.attr('stroke-width', '1');
				line.attr('stroke', '#21331D');
			}
		}
	};
	
	pz.civilians = {
		init : function(){
			var civ, x, y, i, j;

			//create civilian quadtree
			for(i=0; i<screenWidth / 20; i++){
				civilianTree[i] = [];
				for(j=0; j<screenWidth / 20; j++){
					civilianTree[i][j] = [];
				}
			}
			
			for(i=0; i<civilianCount; i++){
				x = mathfloor(mathrandom() * screenWidth);
				y = mathfloor(mathrandom() * screenHeight);
				civ = screen.rect(x, y, 5, 5);
				civ.attr('fill', '#53FF00');
				civ.attr('stroke-width', '3.5');
				civ.attr('stroke', '#53FF00');
				civ.attr('stroke-opacity', '.5');
				civilianTree[mathfloor(x/20)][mathfloor(y/20)].push(civ);
			}
		},
		move : function(){
			var civs, civ, zombs, zomb, i, j, k;
		
			for(i=0; i<screenWidth / 20; i++){
				for(j=0; j<screenHeight / 20; j++){
					civs = civilianTree[i][j];
					for(k=0; k<civs.length; k++){
						civ = civs[k];
						civ.attr('x', civ.attr('x') + mathrandom() * 2);
						civ.attr('y', civ.attr('y') + mathrandom() * 2);
					}
				}
			}
		}
	};
	
	pz.zombies = {
		init : function(){
			var zomb, x, y, i, j;
			
			//create zombie quadtree
			for(i=0; i<screenWidth / 20; i++){
				zombieTree[i] = [];
				for(j=0; j<screenHeight / 20; j++){
					zombieTree[i][j] = [];
				}
			}

			for(i=0; i<zombieCount; i++){
				x = mathfloor(mathrandom() * screenWidth);
				y = mathfloor(mathrandom() * screenHeight);
				zomb = screen.rect(x, y, 5, 5);
				zomb.attr('fill', '#F80F00');
				zomb.attr('stroke-width', '3.5');
				zomb.attr('stroke', '#F80F00');
				zomb.attr('stroke-opacity', '.5');
				zombieTree[mathfloor(x/20)][mathfloor(y/20)].push(zomb);
			}
		},
		move : function(){
			
		}
	};
	
	pz.play = function(){
		pz.civilians.move();
		pz.zombies.move();
			
		playTimer = setTimeout(pz.play, 1000 / fps);
	};
	
	$(function(){
		pz.init();
	});
	
}(window));