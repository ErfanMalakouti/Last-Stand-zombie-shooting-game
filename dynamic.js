const startPage = document.querySelector(".starter");
const startButton = document.querySelector(".start");
const restartButton = document.querySelector(".restart");
const highScore = document.querySelector(".high_score");

const crosshair = document.querySelector(".crosshair");
const survivor = document.querySelector(".survivor");
const spawnPoint = document.querySelector(".spawn-point");

const mainTheme = new Audio("./illustrations/music&audios/mainTheme.mp3");
const reloadSound = new Audio("./illustrations/music&audios/reload.mpeg");
let survivorHurts = new Audio("./illustrations/music&audios/wound.mp3");

let isSurvivorDisable = false;
let point = 0;
let biteCount = 1;
let bulletCount = 1;

const updateCrosshairPosition = (x, y) => {
  crosshair.style.setProperty("--x", `${x}px`);
  crosshair.style.setProperty("--y", `${y}px`);
};

const updateSurvivorDisability = (clientX, clientY) => {
  const deltaX = clientX - window.innerWidth / 2;
  const deltaY = clientY - window.innerHeight / 2;
  const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  isSurvivorDisable = distance < 80;
  if (isSurvivorDisable) {
    survivor.classList.add("disabled");
    return;
  }
  survivor.classList.remove("disabled");
};

const survivorAngle = (clientX, clientY) => {
  const rect = spawnPoint.getBoundingClientRect();
  const middleX = rect.x + rect.width / 2;
  const middleY = rect.y + rect.height / 2;

  const deltaX = clientX - middleX;
  const deltaY = clientY - middleY;

  let angle = Math.atan(deltaY / deltaX);
  if (deltaX < 0) angle += Math.PI;
  return angle;
};
const spawnBullet = (clientX, clientY) => {
  const ammo = document.querySelectorAll(".ammo");
  const reload = document.querySelector(".reload");
  if (isSurvivorDisable) return;
  if (bulletCount === 7) {
    reload.style.display = "block";
    reloadSound.play();
    setTimeout(() => {
      bulletCount = 1;
      reload.style.display = "none";
      ammo.forEach((item) => {
        item.style.zIndex = "1";
      });
    }, 2000);
  }
  const bullet = document.createElement("img");
  ammo[ammo.length - bulletCount].style.zIndex = "-10";
  bulletCount++;
  bullet.classList.add("bullet");
  bullet.src = "./illustrations/images/bullet.svg";
  const { x, y } = spawnPoint.getBoundingClientRect();
  bullet.style.top = `${y}px`;
  bullet.style.left = `${x}px`;

  document.body.append(bullet);

  const angle = survivorAngle(clientX, clientY);
  const animation = bullet.animate(
    [
      { transform: `rotate(${angle}rad) translate(0)` },
      { transform: `rotate(${angle}rad) translate(1000px)` },
    ],
    {
      duration: 1000,
    }
  );
  const shot = new Audio("./illustrations/music&audios/shot.mpeg");
  shot.volume = 0.6;
  shot.play();
  animation.addEventListener("finish", () => {
    bullet.remove();
  });
};

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const angleZombie = (xZombie, yZombie) => {
  const midWindowX = window.innerWidth / 2;
  const midWindowY = window.innerHeight / 2;

  const deltaX = xZombie - midWindowX;
  const deltaY = yZombie - midWindowY;

  let angle = Math.atan(deltaY / deltaX);
  if (deltaX < 0) angle += Math.PI;
  return angle;
};

const updateSurvivorRotation = (clientX, clientY) => {
  if (isSurvivorDisable) return;

  survivor.style.transform = `rotate(${survivorAngle(clientX, clientY)}rad)`;
};

/////////////////////////////////////////////////////
//zombie

const productZombie = () => {
  setInterval(createZombie, 5500);
};

const createZombie = () => {
  const zombie = document.createElement("img");
  zombie.src = "./illustrations/images/zombie.gif";
  zombie.classList.add("zombie");
  let arr = [-55, 125, 55, -125, 110, -10];
  arr = arr.sort(() => Math.random() - 0.5);
  if (arr[0] > 0 && arr[1] > 0) {
    zombie.style.transform = "rotate(45deg)";
  } else if (arr[0] > 0 && arr[1] < 0) {
    zombie.style.transform = "rotate(270deg)";
  } else if (arr[1] < 0 && arr[0] < 0) {
    zombie.style.transform = "rotate(250deg)";
  }
  zombie.style.top = `${arr[0]}%`;
  zombie.style.left = `${arr[1]}%`;
  ////*animate zombies to move to center of screen*////
  const animation = zombie.animate(
    [
      { transform: `` },
      {
        transform: ` `,
        top: `${window.innerHeight / 2 - 40}px`,
        left: `${window.innerWidth / 2 - 40}px`,
      },
    ],
    {
      duration: 5000,
    }
  );
  if (zombie) {
    animation.addEventListener("finish", () => {
      zombie.remove();
    });
  }
  document.body.append(zombie);
};

/////////////////////////////////
const score = () => {
  setInterval(() => {
    const bullet = document.querySelector(".bullet");
    const zombie = document.querySelector(".zombie");
    const scores = document.querySelector(".points");
    if (!bullet) return;
    const rectBullet = bullet.getBoundingClientRect();
    const rectZombie = zombie.getBoundingClientRect();
    if (
      Math.floor(rectBullet.x) - Math.floor(rectZombie.x) < 40 &&
      Math.floor(rectBullet.x) - Math.floor(rectZombie.x) > 0
    ) {
      bullet.remove();
      zombie.remove();
      point++;
      scores.innerHTML = point;
    }
  }, 10);
};
////////////////////////////////////
const damage = () => {
  setInterval(() => {
    const zombie = document.querySelector(".zombie");
    if (!zombie) return;
    const rectZombie = zombie.getBoundingClientRect();
    if (
      window.innerWidth / 2 - Math.floor(rectZombie.x) < 70 &&
      window.innerWidth / 2 - Math.floor(rectZombie.x) > 0 &&
      window.innerHeight / 2 - Math.floor(rectZombie.y) < 70 &&
      window.innerHeight / 2 - Math.floor(rectZombie.y) > 0
    ) {
      const hearts = document.querySelectorAll(".heart");
      survivorHurts.play();
      document.querySelector(".death-zone").classList.add("wounded");
      setTimeout(() => {
        document.querySelector(".death-zone").classList.remove("wounded");
      }, 550);
      hearts[hearts.length - biteCount].style.zIndex = "-10";
      biteCount++;
      zombie.remove();
      if (biteCount === 4) {
        survivorHurts = "";
        highScore.innerHTML = `<p>YOU DIED!<p><p>You're Kills: ${point}</p>`;
        startPage.style.display = "";
      }
    }
  }, 10);
};

const initializeEventListeners = () => {
  document.addEventListener("mousemove", (event) => {
    updateCrosshairPosition(event.clientX, event.clientY);
    updateSurvivorDisability(event.clientX, event.clientY);
    updateSurvivorRotation(event.clientX, event.clientY);
  });
  document.addEventListener("click", (event) => {
    spawnBullet(event.clientX, event.clientY);
    score();
  });
};

const main = () => {
  initializeEventListeners();
  productZombie();
  damage();
};
startButton.addEventListener("click", () => {
  mainTheme.volume = 0.5;
  mainTheme.loop = true;
  mainTheme.play();
  startPage.style.display = "none";
  startButton.style.display = "none";
  restartButton.style.display = "initial";
  setTimeout(() => {
    main();
  }, 50);
});
restartButton.addEventListener("click", () => {
  window.location.reload();
});
