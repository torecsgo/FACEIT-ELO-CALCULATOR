const matchUrl = "https://open.faceit.com/data/v4/matches/";
const playerUrl = "https://open.faceit.com/data/v4/players/";
const TOKEN = "ee36bb05-7c8e-4bb7-8b2b-63548e36fc06";
let URL;

// Obtain MatchId
chrome.tabs.query(
  {
    active: true,
    currentWindow: true,
  },
  function (tabs) {
    url = tabs[0].url;
    URL = url.split("/")[6];

    async function getResponse() {
      const response = await fetch(matchUrl + URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      const data = await response.json();
      let teams = extractPlayers(data);
      const team1 = teams["team1"];
      const team2 = teams["team2"];

      let avgTeam1 = await extractTeamElo(team1);
      let avgTeam2 = await extractTeamElo(team2);

      let resta = avgTeam1 - avgTeam2;
      resta = resta / 2 / 10 / 2;
      resta = Math.round(resta);
      console.log(avgTeam1 + "/" + avgTeam2);
      console.log(resta);
      console.log("Team 1 Wins: " + (25 - resta));
      console.log("Team 1 Loses: " + (25 + resta));

      let text = `
    &nbsp&nbspTeam 1 Wins:  ${25 - resta}
    &nbspTeam 1 Loses: ${25 + resta}
    <br/>
    &nbsp&nbspTeam 2 Wins:  ${25 + resta}
    &nbspTeam 2 Loses: ${25 - resta}
    `;
      let dataDiv = document.getElementById("data");
      dataDiv.innerHTML = text;
    }

    function extractPlayers(data) {
      let arrayPlayersTeam1 = [];
      let arrayPlayersTeam2 = [];

      let team1 = data.teams.faction1.roster;
      let team2 = data.teams.faction2.roster;

      for (let i = 0; i < team1.length; ++i) {
        arrayPlayersTeam1.push(team1[i].player_id);
      }
      for (let i = 0; i < team2.length; ++i) {
        arrayPlayersTeam2.push(team2[i].player_id);
      }
      return {
        team1: arrayPlayersTeam1,
        team2: arrayPlayersTeam2,
      };
    }

    async function extractTeamElo(team) {
      let eloTotal = 0;
      for (let i = 0; i < team.length; ++i) {
        let player = team[i];
        const response = await fetch(playerUrl + player, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        });
        const data = await response.json();
        eloTotal += data.games.csgo.faceit_elo;
      }
      return eloTotal / 5;
    }
    getResponse();
  }
);
