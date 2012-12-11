/*
MIT License
===========

Copyright (c) 2012 Serban Ghita <serbanghita@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

(function($){

    function Chess(){

        var self = this,
            $piece,
            $pieces,
            $board,
            $boardInner,
            $settings;

        this.init = function(options, elem){

            $settings = $.extend({
                squareSize: 45,
                x : [1,2,3,4,5,6,7,8],
                y : [1,2,3,4,5,6,7,8],
                xLiteral : ['a','b','c','d','e','f','g','h'],
                appendTo: document.body,
                type: 'matrix',
                position: null
            }, options);

            $piece = $('<img/>').attr({src: 'images/1x1.png', width: $settings.squareSize, height: $settings.squareSize}).addClass('draggablePiece');

            $pieces = {
                    wp: $piece.clone().addClass('wp'),
                    wr: $piece.clone().addClass('wr'),
                    wn: $piece.clone().addClass('wn'),
                    wb: $piece.clone().addClass('wb'),
                    wk: $piece.clone().addClass('wk'),
                    wq: $piece.clone().addClass('wq'),

                    bp: $piece.clone().addClass('bp'),
                    br: $piece.clone().addClass('br'),
                    bn: $piece.clone().addClass('bn'),
                    bb: $piece.clone().addClass('bb'),
                    bk: $piece.clone().addClass('bk'),
                    bq: $piece.clone().addClass('bq')
                    };

            $board = $('<div></div>').attr({id:'chessBoard'})
                        .css({
                                position: 'relative',
                                width: $settings.squareSize*8,
                                height: $settings.squareSize*8
                            })
                        .addClass('chessBoard');

            $boardInner = $('<div></div>').attr({id:'chessBoardInner'}).addClass('chessBoardInner');

            this.buildBoard();
            this.buildPosition(false, $settings.type, $settings.position);
            this.drawBoard();

        }

        this.buildBoard = function(){

            // @todo - Reverse pieces here.
            $settings.newY = $settings.y.slice();
            $settings.newY.reverse();

            for(x in $settings.x){
                for(y in $settings.newY){

                   var tmpSquare = $('<div></div>')
                                   .attr({id: 'pos'+$settings.x[x]+''+$settings.y[y]})
                                   .css({
                                       left: (($settings.x[x]-1)*$settings.squareSize),
                                       top: (($settings.newY[y]-1)*$settings.squareSize),
                                       position: 'absolute',
                                       width: $settings.squareSize,
                                       height: $settings.squareSize
                                       })
                                   .addClass('square '+(x%2 ? 'evenX' : 'oddX')+' '+(y%2 ? 'evenY' : 'oddY'));
                   var tmpSquareNotation = $('<div></div>')
                                           .css({
                                               position: 'absolute',
                                               bottom:0,
                                               left:0,
                                               fontSize:'56%'
                                           })
                                           .addClass('squareNotation')
                                           .html($settings.xLiteral[$settings.x[x]-1]+''+$settings.y[y]);
                   tmpSquare.append(tmpSquareNotation);
                   $boardInner.append(tmpSquare);

                }
            }

        }

        // Build position, including the start position.

        this.buildPosition = function(start, type, position){

            if(start){

               // Initial black pieces position.
                $boardInner.find('#pos17,#pos27,#pos37,#pos47,#pos57,#pos67,#pos77,#pos87').append($pieces.bp);
                $boardInner.find('#pos18,#pos88').append($pieces.br);
                $boardInner.find('#pos28,#pos78').append($pieces.bn);
                $boardInner.find('#pos38,#pos68').append($pieces.bb);
                $boardInner.find('#pos58').append($pieces.bk);
                $boardInner.find('#pos48').append($pieces.bq);

                // Initial white pieces position.
                $boardInner.find('#pos12,#pos22,#pos32,#pos42,#pos52,#pos62,#pos72,#pos82').append($pieces.wp);
                $boardInner.find('#pos11,#pos81').append($pieces.wr);
                $boardInner.find('#pos21,#pos71').append($pieces.wn);
                $boardInner.find('#pos31,#pos61').append($pieces.wb);
                $boardInner.find('#pos51').append($pieces.wk);
                $boardInner.find('#pos41').append($pieces.wq);

            }

            if(typeof type === 'string'){
                switch(type){
                    case 'matrix':
                        this._arrangeMatrixPosition(position);
                        break;
                    case 'fen':
                        this._arrangeMatrixPosition(this._fenToPosition(position));
                        break;
                    default:
                        alert(1);
                }
            }

            // Make pieces draggable.
            $boardInner.find('.draggablePiece').draggable({
                //grid: [ $settings.squareSize,$settings.squareSize ],
                revert: 'invalid',
                stack: $boardInner.find('.draggablePiece'),
                start: function (event, ui){
                    $(this).css({position: 'absolute'});
                    self.rules($(this));
                }
            });

            // Make pieces droppable.
            $boardInner.find('.square').droppable({
                accept: '.draggablePiece',
                tolerance: 'intersect',
                drop: function( event, ui ) {
                    //$( this ).addClass( "ui-state-highlight" );
                    $(this).find('.draggablePiece').css({display:'none'});
                    $(this).append(ui.draggable.css('position','static'));
                    //console.log('drop');
                }
            });

        }

        this._fenToPosition = function(fen){
            var position = [];
            var rows = fen.split('/');
            for(var i=0; i<rows.length; i++){
                var row = rows[i]
                var cells = row.split('');
                var positionRow = [];
                for(var j=0; j<cells.length; j++){
                    if(Number(cells[j])){
                        for(var k=0; k<Number(cells[j]); k++){
                            positionRow.push(0);
                        }
                    } else if (cells[j] == cells[j].toUpperCase()){
                        positionRow.push('w' + cells[j].toLowerCase());
                    } else if (cells[j] == cells[j].toLowerCase()){
                        positionRow.push('b' + cells[j].toLowerCase());
                    }
                }
                position.push(positionRow);
            }
            return position;
        }

        // Private function that arranges the board by matrix.
        this._arrangeMatrixPosition = function(position){
            if(!position){

                // Start position.
                position = [
                    ['br','bn','bb','bq','bk','bb','bn','br'],
                    ['bp','bp','bp','bp','bp','bp','bp','bp'],
                    [ 00 , 00 , 00 , 00 , 00 , 00 , 00 , 00 ],
                    [ 00 , 00 , 00 , 00 , 00 , 00 , 00 , 00 ],
                    [ 00 , 00 , 00 , 00 , 00 , 00 , 00 , 00 ],
                    [ 00 , 00 , 00 , 00 , 00 , 00 , 00 , 00 ],
                    ['wp','wp','wp','wp','wp','wp','wp','wp'],
                    ['wr','wn','wb','wq','wk','wb','wn','wr']
                ];

            }
            position.reverse();

            for(y in position){
                for(x in position[y]){
                    if(position[y][x] != 0){
                        $boardInner.find('#pos'+Number(parseInt(x)+1)+Number(parseInt(y)+1)).append($pieces[position[y][x]].clone());
                    }
                }
            }
        }

        // @todo: Append to element.
        this.drawBoard = function(){

            $board.append($boardInner);
            $board.appendTo($settings.appendTo);

        }

        // Rules.

        // Peon.
        this.rules = function($piece){

            if($piece.hasClass('wp')){
                var pieceType = 'p';
            }

            // Peon can only move on the y axis.
            switch(pieceType){
                case 'p':
                    // Get the current coords.
                    var currentPos = $piece.parents('.square').attr('id').split('pos')[1];
                    //console.log(currentPos);
                    // Mark the valid move fields.
                    var currentX = parseInt(currentPos.substring(0,1));
                    var currentY = parseInt(currentPos.substring(1,2));
                    //console.log(currentX); console.log(currentY);

                    // Mark all fields =<(y+2)
                    var i=0;
                    for(i=currentY;i<=(currentY+2);i++){
                        $('#pos'+currentX+i).addClass('highlight');
                    }

                break;
            }
        }


    }

    $.fn.chess = function(options){

        var c = new Chess();
        c.init(options, this);

    }

})(jQuery);