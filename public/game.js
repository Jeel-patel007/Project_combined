var gameTable=document.getElementById("game-table");
var cells=[];
var counter=2;
var score=0;
var timeout=10;


function startGame(){
   
   setInterval((dipalytime) => {
      document.getElementById("time").textContent=timeout;
      timeout--;

      if(timeout===0){
         alert(`times up  `)
         Finishgame(score);
         

      }
      if(timeout<0){
         document.getElementById("timeout").style.display ='none';
         
         
      }
      
   }, 2000);

    gameTable.innerHTML = "";
    cells=[];
 
     var letters="0123456789ABCDEF";
     var color="#";

     for(i=0;i<6;i++){
        color +=letters[Math.floor(Math.random() * 16)];
     }

     
     for(i=0;i<counter;i++){
        var row=gameTable.insertRow()
        for(j=0;j<counter;j++){
            var cell=row.insertCell();
            cell.addEventListener("click",cellclickeventHandler);
            cells.push(cell);
            cell.style.backgroundColor= color;
            
        }

     }

     var colnumber= document.querySelectorAll("td");
     var index= Math.floor(Math.random() * colnumber.length);
     colnumber[index].style.opacity=0.7;
     colnumber[index].isDifferent=true;

    }
     function cellclickeventHandler(){
        if(this.isDifferent){
        counter++;
        score++;
        updateScore(score);
        startGame();

        }
        else{
            updateScore(0);
            counter=2;
            alert('oops try again !')
        }
     }

     function updateScore(newscore){
        score=newscore;
        document.getElementById("score-value").textContent =score;
     }

     function Finishgame(score){
      updateScore(0);
      counter=2;
      gameTable.innerHTML ="";
      
      var para= document.getElementById("endgame");
      para.innerText="your score is : " + score;


     }

