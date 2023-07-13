import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APIGatewayHandlerComponent } from './apigateway-handler.component';

describe('APIGatewayHandlerComponent', () => {
  let component: APIGatewayHandlerComponent;
  let fixture: ComponentFixture<APIGatewayHandlerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [APIGatewayHandlerComponent]
    });
    fixture = TestBed.createComponent(APIGatewayHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
