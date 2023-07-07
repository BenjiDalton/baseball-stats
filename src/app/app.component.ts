import { Component, OnInit, OnDestroy,  NgZone, ChangeDetectorRef, ComponentFactoryResolver} from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Chart, TimeScale } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

/* Goals 

1. Hovering over point on line chart shows each teams record at that time
2. Hovering over bar charts indicates each teams respective rank for that stat
3. Add pitching stats
4. If no teams are active then all charts disappear (preserve stats chosen)
5. Slider to allow user to display specific portions of schedule
*/

export class AppComponent implements OnInit, OnDestroy{

  title='baseball_scraper_app';
  awayData: any;
  homeData: any;
  teamData: any;
  isButtonClicked=false;
  displayStatOptions=false;
  displaySlider=false;
  pageLoaded=false;
  activeButtons={
    "Teams": {} as { [key: string]: boolean },
    "Stats": {} as { [key: string]: boolean },
    "Years": {} as { [key: string]: boolean }
  };
  highlightedDivisions: { [key: string]: boolean }={};
  team1: any;
  team2: any;
  allTeamsData: any;
  yearsData: {
    [year: string]: any;}={
      "2021": {},
      "2022": {}
    };
  currentYearData: any;
  teamNames: any;
  chart: any;
  chartData: any;
  activeTeams: any[]=[];
  activeStats: any[]=[];
  activeYear: any;
  scheduleData: any[]=[];
  teamStatistics: any[]=[];
  sliderValue: any;
  pointRadius=4;
  divisions={
    "AmericanLeague": {
      "East": [
        "Baltimore Orioles",
        "Boston Red Sox",
        "New York Yankees",
        "Tampa Bay Rays",
        "Toronto Blue Jays"
      ],
      "Central": [
        "Chicago White Sox",
        "Cleveland Guardians",
        "Detroit Tigers",
        "Kansas City Royals",
        "Minnesota Twins"
      ],
      "West": [
        "Houston Astros",
        "Los Angeles Angels",
        "Oakland Athletics",
        "Seattle Mariners",
        "Texas Rangers"
      ]
    },
    "NationalLeague": {
      "East": [
        "Atlanta Braves",
        "Miami Marlins",
        "New York Mets",
        "Philadelphia Phillies",
        "Washington Nationals"
      ],
      "Central": [
        "Chicago Cubs",
        "Cincinnati Reds",
        "Milwaukee Brewers",
        "Pittsburgh Pirates",
        "St. Louis Cardinals"
      ],
      "West": [
        "Arizona Diamondbacks",
        "Colorado Rockies",
        "Los Angeles Dodgers",
        "San Diego Padres",
        "San Francisco Giants"
      ]
    }
  }

  constructor(private httpclient: HttpClient, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
  }
  ngOnInit(): void {
    this.fetch2021Schedule().subscribe(([teamData, statNames]) => {
      this.yearsData["2021"]=teamData
      this.teamStatistics=statNames;
    });
    this.fetch2022Schedule().subscribe(([teamData, statNames]) => {
      this.yearsData["2022"]=teamData
      this.teamNames=Object.keys(teamData);
      this.pageLoaded=true;
      this.activeYear="2022"
      this.currentYearData=this.yearsData[this.activeYear]
    });
    
    
  }
  ngOnDestroy(): void {
    this.destroyChart()
  }
  fetch2022Schedule(): Observable<any[]> {
    return new Observable<any[]>((observer) => {
    this.httpclient.get<any[]>('https://nw00meomfg.execute-api.us-east-2.amazonaws.com/dev/2022-scraper').subscribe(result => {
      const [teamData, statNames]=result;
      observer.next([teamData, statNames]);
      observer.complete();
    })})
  }
  fetch2021Schedule(): Observable<any[]> {
    return new Observable<any[]>((observer) => {
    this.httpclient.get<any[]>('https://nw00meomfg.execute-api.us-east-2.amazonaws.com/dev/2021-scraper').subscribe(result => {
      const [teamData, statNames]=result;
      observer.next([teamData, statNames]);
      observer.complete();
    })})
  }

  getCheckboxStatus(): void {
    const checkbox=document.getElementById("myCheckbox");
    if (checkbox instanceof HTMLInputElement) {
      if (checkbox.checked) {
        this.activeYear="2022"
      } else {
        this.activeYear="2021"
      }
      for (let button in this.activeButtons["Teams"]) {
        this.activeButtons["Teams"][button]=false;
      }
      this.activeTeams=[];
      this.currentYearData=this.yearsData[this.activeYear]
    }
    console.log("active buttons", this.activeButtons)
    console.log("active teams", this.activeTeams)
  }
  toggleButton(target: EventTarget | null, subclass: "Teams" | "Stats"): void {
    if (target instanceof HTMLElement) {
      const buttonId=target.id;
      this.activeButtons[subclass][buttonId]=!this.activeButtons[subclass]?.[buttonId];
      if (subclass==="Teams") {
        const buttonContainer=document.querySelector(".teams-dropdown-content")
        const buttons=buttonContainer?.querySelectorAll("button") 
        buttons?.forEach((button) => {
          const team=this.currentYearData[button.id];
          if (this.activeButtons[subclass][button.id]) {
            if (!this.activeTeams.includes(team)) {
              this.activeTeams.push(team);
              if (this.activeButtons[subclass][buttonId]===true){
                this.addLine()
              } else if (this.activeButtons[subclass][buttonId]===false){
                this.removeLine()
              }
            }
          } else {
            const index=this.activeTeams.indexOf(team);
            if (index !== -1) {
              this.activeTeams.splice(index, 1);
              this.removeLine()
            }
          }
        });
      } else if (subclass==='Stats') {
        const buttonContainer=document.querySelector(".stats-dropdown-content")
        const buttons=buttonContainer?.querySelectorAll("button") 
        
        buttons?.forEach((button) => {
          if (this.activeButtons[subclass][button.id]) {
            if (!this.activeStats.includes(button.id)) {
              this.activeStats.push(button.id);
              this.ngZone.run(() => {
                this.cdr.detectChanges();
                this.generateBarCharts(button.id);
              });
            }
          } else {
            const index=this.activeStats.indexOf(button.id);
            if (index !== -1) {
              this.activeStats.splice(index, 1);
              this.removeSmallChart(button.id);
            }
          }
        });
      }
  }
  this.updateCharts()
  }
  highlightDivision(divisionId: string): void {
    const buttonContainer=document.querySelector(`.teams-dropdown-subheader#${divisionId}`)
    const buttons=buttonContainer?.querySelectorAll("button")
    
    if (!this.highlightedDivisions[divisionId]) {
      buttons?.forEach((button) => {
        if (button.id){
          this.activeButtons['Teams'][button.id]=false;
          this.toggleButton(button, "Teams");
        }
      });
      this.highlightedDivisions[divisionId]=true;
    } else {
      buttons?.forEach((button) => {
        if (button.id){
          this.toggleButton(button, "Teams");
        }
      });
      this.highlightedDivisions[divisionId]=false;
    }
  }
  switchStatus(event: Event): void {
    console.log("lol doesn't do anything anymore but maybe will one day idk")
  }
  generateChart(): void {
    this.destroyChart();
    this.displayStatOptions=true;
    this.displaySlider=true;
    const canvas: any=document.getElementById("myChart");
    const increment=1;
    let maxGames: any;
    let pointStyle: any;
    if (this.activeYear==="2021") {
      pointStyle="circle";
    } else if (this.activeYear==="2022") {
      pointStyle="triangle";
    } 
    
    if (!this.sliderValue) {
      maxGames=162;
    } else {
      maxGames=this.sliderValue;
    }
    const labels=Array.from({length: Math.ceil(maxGames / increment) }, (_, index) => (index * increment).toString());
    
    this.chartData={
      labels: labels,
      datasets: [
        ...this.activeTeams.map((team, index) => ({
          label: team.name + ` (${this.activeYear})`,
          data: team.netRecord,
          backgroundColor: team.mainColor,
          borderColor: team.secondaryColor,
          borderWidth: 2,
          pointRadius: this.pointRadius,
          pointStyle: pointStyle
        }))
      ]
    };
    this.chart=new Chart(canvas, {
      type: 'line',
      data: this.chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            }
          },
          x: {
            beginAtZero: true,
            grid: {
              display: false
            }
          }
        },
        interaction: {
          intersect: true,
          mode: 'index'
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                this.title=["Game"+ `${context.dataIndex + 1}`];
                let label=context.dataset.label || '';
                let wins=0;
                let losses=0;
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  const dataIndex=context.dataIndex;
                  const winLoss: any=context.dataset.data;
                  for (let i=0; i<=dataIndex; i++) {
                    const value: any=winLoss[i];
                    if (value > winLoss[i-1]) {
                      wins+=1;
                    } else {
                      losses+=1;
                    }
                  }
        
                  // Append total wins and losses to the label
                  label+=`${wins}-${losses}`;
                }
                return label;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true
            }
          }
        },
      }
    });
  }
  generateBarCharts(stat: string): void {
    const canvas: any=document.getElementById(stat+"Chart")
    let statIndex=this.teamStatistics.indexOf(stat)
    const chartData={
      labels: ["Teams"],
      datasets: [
        ...this.activeTeams.map((team, index) => ({
          
          label: team.name,
          data: [team.stats[statIndex]],
          backgroundColor: team.mainColor,
          borderColor: team.secondaryColor,
          borderWidth: 2
        }))
      ]
    };

    new Chart(canvas, {
      type: 'bar',
      data: chartData,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            }
          },
          x: {
            display: false,
            beginAtZero: true,
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false,
            position: 'top'
          },
          title: {
            display: true,
            text: stat,
            position: 'left'
          },
          datalabels: {
            anchor: 'center',
            align: 'center',
            font: {
              weight: 'bold'
            },
            color: '#ffffff', // Customize the label text color
            formatter: function(value: any, context: any) {
              const datasetIndex=context.datasetIndex;
              const teamName=chartData.datasets[datasetIndex].label;
              const shortenedName: string=teamName.split(' ').pop();
              let formattedValue: string;
              if (value<1) {
                formattedValue=value.toFixed(3);
              } else {
                formattedValue=value.toFixed(0);
              }
              
              return [shortenedName, formattedValue];
            },
            textAlign: 'center'
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }
  updateCharts(): void {
    this.activeStats.forEach((stat) => {
      const canvas: any=document.getElementById(stat + "Chart");
      const existingChart=Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }
      this.generateBarCharts(stat)
    });
  }
  updateSliderValue(): void {
    const slider=document.getElementById("mySlider") as HTMLInputElement;
    this.sliderValue=slider.value
    this.generateChart()
  }
  resetTeamsandChart(keepStats: boolean): void {
    this.displayStatOptions=keepStats;
    this.displaySlider=false;
    this.activeButtons={
      "Teams": {} as { [key: string]: boolean },
      "Stats": {} as { [key: string]: boolean },
      "Years": {} as { [key: string]: boolean }
    };
    this.activeTeams=[];
    for (let stat of this.activeStats) {
      this.removeSmallChart(stat)
    };
    
    this.activeStats=[];
    this.destroyChart();
  }
  addLine(): void {
    if (this.chartData) {
      const newTeamIndex=this.activeTeams.length - 1;
      let pointStyle: any;
      if (this.activeYear==="2021") {
        pointStyle="circle";
      } else if (this.activeYear==="2022") {
        pointStyle="triangle";
      }
      const newDataset={
        label: this.activeTeams[newTeamIndex].name  + ` (${this.activeYear})`,
        data: this.activeTeams[newTeamIndex].netRecord,
        backgroundColor: this.activeTeams[newTeamIndex].mainColor,
        borderColor: this.activeTeams[newTeamIndex].secondaryColor,
        borderWidth: 2,
        pointRadius: this.pointRadius,
        pointStyle: pointStyle
      };
        this.chartData.datasets.push(newDataset);
        this.chart.data=this.chartData;
        this.chart.update();
    } else {
      this.generateChart()
    }
  }
  removeLine(): void {
    this.chartData.datasets=this.chartData.datasets.filter((dataset: any) => {
      if (!this.activeTeams.some((team: any) => team.name===dataset.label)) {
        return false;
      }
      return true; 
    });
    this.chart.update();
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
  private removeSmallChart(stat: string): void {
    const canvas: any=document.getElementById(stat + "Chart");
    if (canvas) {
      canvas.remove();
    }
  }
}