import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { DataTableComponent } from './data-table/data-table.component';
import { APIGatewayHandlerComponent } from './apigateway-handler/apigateway-handler.component';

@NgModule({
  declarations: [
    AppComponent,
    DataTableComponent,
    APIGatewayHandlerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [APIGatewayHandlerComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
