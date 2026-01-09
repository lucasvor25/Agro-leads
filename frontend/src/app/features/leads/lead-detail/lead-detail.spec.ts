import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadDetail } from './lead-detail';

describe('LeadDetail', () => {
  let component: LeadDetail;
  let fixture: ComponentFixture<LeadDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
