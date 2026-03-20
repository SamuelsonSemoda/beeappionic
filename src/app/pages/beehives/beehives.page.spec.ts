import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeehivesPage } from './beehives.page';

describe('BeehivesPage', () => {
  let component: BeehivesPage;
  let fixture: ComponentFixture<BeehivesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BeehivesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
