import { Component, OnInit, OnDestroy,  NgZone, ChangeDetectorRef} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})

/* Goals 
2. Hovering over bar charts indicates each teams respective rank for that stat
3. Add pitching stats
4. If no teams are active then all charts disappear (preserve stats chosen)
*/

export class AppComponent implements OnInit, OnDestroy{
	constructor(private httpclient: HttpClient, private ngZone: NgZone, private cdr: ChangeDetectorRef) {
	}
	title='baseball_scraper_app';
	
	displayStatOptions=false;
	displaySlider=false;
	displayTable=false;
	pageLoaded=false;
	
	activeButtons: any={
		"Divisions": {} as { [key: string]: boolean },
		"Teams": {} as { [key: string]: boolean },
		"pitchingStats": {} as { [key: string]: boolean },
		"battingStats": {} as { [key: string]: boolean },
		"2021": {
			"Teams": {}
		},
		"2022": {
			"Teams": {}
		}
	};
	entireMLB={
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
	};
	yearsData: {[year: string]: any;}={
			"2021": {
				"Teams": {},
				"battingStats": {},
				"pitchingStats": {}
			},
			"2022": {
				"Teams": {},
				"battingStats": {},
				"pitchingStats": {}
			}
		};
	
	chart: any;
	chartData: any = {
		"labels": {},
		"datasets": []
	};
	activeYear: any;
	currentYearData: any;
	teamNames: any;
	activeTeams: {[year: string]: any;}={
		"2021": [],
		"2022": []
	}
	activeStats: any = {
		"2021": {
			"pitchingStats": {},
			"battingStats": {}
		},
		"2022": {
			"pitchingStats": {},
			"battingStats": {}
		}
	};
	battingStats: any[]=[];
	pitchingStats: any[]=[];
	maxSliderValue: any;
	pointRadius=4;

	ngOnInit(): void {
		this.fetch2021Schedule().subscribe(([teamData, statNames]) => {
			this.yearsData["2021"]["Teams"]=teamData;
			this.yearsData["2021"]["battingStats"]=statNames.battingStats;
			this.yearsData["2021"]["pitchingStats"]=statNames.pitchingStats;
		});
		this.fetch2022Schedule().subscribe(([teamData, statNames]) => {
			this.yearsData["2022"]["Teams"]=teamData;
			this.yearsData["2022"]["battingStats"]=statNames.battingStats;
			this.yearsData["2022"]["pitchingStats"]=statNames.pitchingStats;
			this.teamNames=Object.keys(teamData);
			this.pageLoaded=true;
			this.activeYear="2022";
			this.currentYearData=this.yearsData[this.activeYear];
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
			// for (let button in this.activeButtons["Teams"]) {
			// 	this.activeButtons["Teams"][button]=false;
			// }
			// this.activeTeams=[];
			this.currentYearData=this.yearsData[this.activeYear]
		}
	}
	toggleButton(eventTarget: EventTarget | null, subclass: "Divisions"| "Teams" | "pitchingStats"| "battingStats"): void {
		if (eventTarget instanceof HTMLElement) {

			if (subclass==="Teams") {
				const buttonId=eventTarget.id;
				this.activeButtons[this.activeYear][subclass][buttonId]=!this.activeButtons[this.activeYear][subclass]?.[buttonId];
				console.log("Active buttons when subclass == team", this.activeButtons)
				this.handleTeams()
			} else if (subclass==="pitchingStats" || subclass==="battingStats") {
				if (eventTarget.parentElement){
					const buttonId=eventTarget.id;
					this.activeButtons[subclass][buttonId]=!this.activeButtons[subclass]?.[buttonId];
					this.handleStats(subclass)
				}
			}
			if (subclass==="Divisions") {
				if (eventTarget.parentElement){
					const divisionId=eventTarget.parentElement.id
					this.activeButtons[subclass][divisionId]=!this.activeButtons[subclass]?.[divisionId];
					this.handleDivision(divisionId)
				}
			}
		}
	this.generateBarCharts()
	}
	handleTeams(): void {
		const buttonContainer=document.querySelector(".teams-dropdown-content")
		const buttons=buttonContainer?.querySelectorAll("button") 
		if (!this.activeTeams[this.activeYear]) {
			this.activeTeams[this.activeYear]=[]
		}
		if (!this.activeButtons[this.activeYear]["Teams"]) {
			this.activeButtons[this.activeYear]["Teams"]=[]
		}
		console.log("active buttons: ", this.activeButtons)
		buttons?.forEach((button) => {
			const team=this.currentYearData['Teams'][button.id];
			if (this.activeButtons[this.activeYear]["Teams"][button.id] && !this.activeTeams[this.activeYear].includes(team)) {
					this.activeTeams[this.activeYear].push(team);
					this.addLine()
			} else if (!this.activeButtons[this.activeYear]["Teams"][button.id] && this.activeTeams[this.activeYear].includes(team)) {
					const index=this.activeTeams[this.activeYear].indexOf(team);
					if (index !== -1) {
						this.activeTeams[this.activeYear].splice(index, 1);
						this.generateChart()
				}
			}
		});
		console.log("handle teams", this.activeTeams)
	}
	handleStats(statCategory: "pitchingStats"| "battingStats"): void {
		const buttonContainer=document.querySelector(`.stats-dropdown-content#${statCategory}`)
		const buttons=buttonContainer?.querySelectorAll("button")
		
		buttons?.forEach((button) => {
			if (this.activeButtons[statCategory][button.id]) {
				if (!this.activeStats[this.activeYear][statCategory][button.id]) {
					this.activeStats[this.activeYear][statCategory][button.id]=!this.activeStats[this.activeYear][statCategory][button.id]
					this.detectChanges()
				}
			} else {
				delete this.activeStats[this.activeYear][statCategory][button.id];
				}
			});
		this.generateBarCharts()
	}
	handleDivision(divisionId: string): void {
		const buttonContainer=document.querySelector(`.teams-dropdown-subheader#${divisionId}`)
		const buttons=buttonContainer?.querySelectorAll("button")
		if (this.activeButtons["Divisions"][divisionId]) {
			buttons?.forEach((button) => {
				if (button.id){
					this.activeButtons['Teams'][button.id]=true;
					this.handleTeams()
				}
			});
		} else {
			buttons?.forEach((button) => {
				if (button.id){
					this.activeButtons['Teams'][button.id]=false;
					this.handleTeams()
				}
			});
			this.activeButtons["Divisions"][divisionId]=false;
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
		if (!this.maxSliderValue) {
			maxGames = 162;
		  } else {
			maxGames = this.maxSliderValue;
		}
		const labels = Array.from({ length: Math.ceil(maxGames / increment) }, (_, index) => (index * increment).toString());
		this.chartData["labels"]=labels
		
		for (let year of ["2021", "2022"]) {
			if (year==="2021") {
				pointStyle="circle";
			} else if (year==="2022") {
				pointStyle="triangle";
			}
			
			const yearData=this.activeTeams[year].map((team: any, index: any) => ({
				label: team.name + ` (${year})`,
				data: team.netRecord,
				backgroundColor: team.mainColor,
				borderColor: team.secondaryColor,
				borderWidth: 2,
				pointRadius: this.pointRadius,
				pointStyle: pointStyle
			  }));
			this.chartData["datasets"].push(...yearData);
		}
		console.log('2232', this.chartData)
		this.chart=new Chart(canvas, {
			type: 'line',
			data: this.chartData["datasets"],
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
									label+=`${wins}-${losses}`;
								}
								return label;
							}
						}
					},
					legend: {
						position: 'top',
						labels: {
							font: {
								size: 14,
								weight: 'bold'
							},
							usePointStyle: true
						}
					}
				},
			}
		});
		this.chart.update()
	}

	generateBarCharts(): void {
		const chartDataMap: Record<string, any> = {};
		
		for (let year in this.activeTeams) {
			const teams = this.activeTeams[year];
			const yearData: any[] = [];

			for (let statCategory of ["pitchingStats", "battingStats"]) {
				Object.keys(this.activeStats[year][statCategory]).forEach((stat) => {
					const chartID = document.getElementById(statCategory + "-" + stat + "-Chart");

					const chartData = {
						labels: ["Teams"],
						datasets: teams.map((team: any, index: any) => ({
							label: team.name + " (" + year + ")",
							data: [team[statCategory][stat]],
							backgroundColor: team.mainColor,
							borderColor: team.secondaryColor,
							borderWidth: 2,
						})),
					};

					if (chartID) {
						const chartDataObj = {
							"chartData": chartData,
							"stat": stat,
							"chartID": chartID
						};
					yearData.push(chartDataObj);
					console.log("year data", yearData)
					}
				});
			}

		if (yearData.length > 0) {
			chartDataMap[year] = yearData;
		}

		console.log("chartdatamap: ", chartDataMap)
		for (let year in chartDataMap) {
			const yearData = chartDataMap[year];

			for (let chartDataObj of yearData) {
				console.log(chartDataObj["chartID"])
				const chartID = document.getElementById(chartDataObj["chartID"].id);
				const chartData = chartDataObj["chartData"];

				if (chartID) {
					const existingChart = Chart.getChart(chartID.id);

					if (existingChart) {
						existingChart.destroy();
					}

					const canvas: any = document.getElementById(chartID.id);

					new Chart(canvas, {
						type: 'bar',
						data: chartData,
						options: {
						scales: {
							y: {
							beginAtZero: true,
							grid: {
								display: false,
							},
							},
							x: {
							display: false,
							beginAtZero: true,
							grid: {
								display: false,
							},
							},
						},
						plugins: {
							legend: {
							display: false,
							position: 'top',
							},
							title: {
							display: true,
							text: chartDataObj["stat"],
							position: 'left',
							},
							datalabels: {
							anchor: 'center',
							align: 'center',
							font: {
								size: 16,
								weight: 'bold',
							},
							color: 'white',
							formatter: function (value: any, context: any) {
								const datasetIndex = context.datasetIndex;
								const teamName = chartData.datasets[datasetIndex].label;
								const shortenedName: string = teamName.split(' ').pop();
								let formattedValue: string;

								if (value < 1) {
								formattedValue = value.toFixed(3);
								} else {
								formattedValue = value.toFixed(0);
								}

								return formattedValue;
							},
							textAlign: 'center',
							},
						},
						},
						plugins: [ChartDataLabels],
					});
				}
			}
		}
		}
		this.detectChanges();
	  }
	  
	updateSliderValue(): void {
		const maxSlider=document.getElementById("maxSlider") as HTMLInputElement;
		this.maxSliderValue=maxSlider.value
		this.generateChart()
	}
	resetTeamsandChart(keepStats: boolean): void {
		this.displayStatOptions=keepStats;
		this.displaySlider=false;
		this.activeButtons={
			"Divisions": {} as { [key: string]: boolean },
			"Teams": {} as { [key: string]: boolean },
			"pitchingStats": {} as { [key: string]: boolean },
			"battingStats": {} as { [key: string]: boolean },
			"2021": {
				"Teams": []
			},
			"2022": {
				"Teams": []
			}
		};
		this.activeTeams = [];
		// for (let stat of this.activeStats) {
		//   this.removeSmallChart(stat)
		// };
		
		// this.activeStats=[];
		this.destroyChart();
	}
	addLine(): void {
		if (this.chartData["datasets"].length>0) {
			const newTeamIndex=this.activeTeams[this.activeYear].length - 1;
			let pointStyle: any;
			if (this.activeYear==="2021") {
				pointStyle="circle";
			} else if (this.activeYear==="2022") {
				pointStyle="triangle";
			}
			const newDataset={
				label: this.activeTeams[this.activeYear][newTeamIndex].name  + ` (${this.activeYear})`,
				data: this.activeTeams[this.activeYear][newTeamIndex].netRecord,
				backgroundColor: this.activeTeams[this.activeYear][newTeamIndex].mainColor,
				borderColor: this.activeTeams[this.activeYear][newTeamIndex].secondaryColor,
				borderWidth: 2,
				pointRadius: this.pointRadius,
				pointStyle: pointStyle
			};
			this.chartData["datasets"].push(newDataset);
			this.chart.data=this.chartData;
			this.chart.update();
		} else {
			this.generateChart()
		}
	}
	removeLine(): void {
		this.chartData.datasets=this.chartData["datasets"].filter((dataset: any) => {
			if (!this.activeTeams[this.activeYear].some((team: any) => team.name+ ` (${this.activeYear})`===dataset.label)) {
				return false;
			}
			return true; 
		});
		this.chart.update();
	}
	toggleTable(): void {
		this.displayTable=true;
	}
	private detectChanges(): void {
		this.ngZone.run(() => {
			this.cdr.detectChanges();
		});
	}
	private destroyChart(): void {
		if (this.chart) {
		  this.chart.destroy();
		  this.chart = null;
		}
	  }
	
}