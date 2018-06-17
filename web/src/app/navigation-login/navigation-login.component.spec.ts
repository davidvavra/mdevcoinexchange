import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationLoginComponent } from './navigation-login.component';

describe('NavigationLoginComponent', () => {
  let component: NavigationLoginComponent;
  let fixture: ComponentFixture<NavigationLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigationLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
