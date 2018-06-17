import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestOffersComponent } from './latest-offers.component';

describe('OfferListComponent', () => {
  let component: LatestOffersComponent;
  let fixture: ComponentFixture<LatestOffersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LatestOffersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LatestOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
