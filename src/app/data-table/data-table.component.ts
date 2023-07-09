import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnChanges {
  @Input() yearsData: any;
  @Input() activeYear: any;
  @Input() entireMLB: any;
  selectedStatsCategory: any='pitchingStats';
  selectedLeague: any;
  selectedDivision: any;
  tableTeams: any;
  tableData: any;

  /* 
  currently this.yearData gets updated to only include those from a chosen division 
  we want it to preserve all teams
  */
  
  ngOnChanges(changes: SimpleChanges): void {
	if (changes['yearsData'] && changes['activeYear']) {
	  this.initializeTableData();
	}
  }
  private initializeTableData(): void {
	if (this.yearsData && this.activeYear && this.yearsData[this.activeYear]) {
	  this.tableData = this.yearsData[this.activeYear];
	} else {
	  this.tableData = null;
	}
  }
  getStatsForTeam(team: any): any {
	return Object.values(this.tableData[this.activeYear]['Teams'][team][this.selectedStatsCategory]);
  }
  getStatsCategory(eventTarget: any): void {
	console.log("year data in stats category: ", this.yearsData)
	this.selectedStatsCategory=eventTarget.value;
  }
  getLeague(eventTarget: any): void {
	this.selectedLeague=eventTarget.value;
  }
  getDivision(eventTarget: any): void {
	this.selectedDivision=eventTarget.value;
	this.tableData['Teams'] = this.entireMLB[this.selectedLeague][this.selectedDivision].map((team: any) => {
	  return this.yearsData[this.activeYear]['Teams'][team];
	  });
	console.log(this.yearsData)
	console.log(this.tableData)
	}
	// if (this.entireMLB[this.selectedLeague][this.selectedDivision]){
	//   this.tableData=this.entireMLB[this.selectedLeague][this.selectedDivision].map((team: any) => {
	//     return this.yearsData[this.activeYear]['Teams'][team];
	//   })
	//   console.log(this.tableData)
	// } else {
	//   this.selectedDivision=[]
	// }
}
