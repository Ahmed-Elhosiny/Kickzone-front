import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { fieldOwnerGuard } from './field-owner-guard';
import { AuthService } from './auth';

describe('fieldOwnerGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUserRole']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow access for field owners', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getUserRole.and.returnValue('FieldOwner');

    const result = TestBed.runInInjectionContext(() =>
      fieldOwnerGuard({} as any, { url: '/field-owner/my-fields' } as any)
    );

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow access for admins', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getUserRole.and.returnValue('Admin');

    const result = TestBed.runInInjectionContext(() =>
      fieldOwnerGuard({} as any, { url: '/field-owner/my-fields' } as any)
    );

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to home for regular users', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.getUserRole.and.returnValue('User');

    const result = TestBed.runInInjectionContext(() =>
      fieldOwnerGuard({} as any, { url: '/field-owner/my-fields' } as any)
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should redirect to login for unauthenticated users', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      fieldOwnerGuard({} as any, { url: '/field-owner/my-fields' } as any)
    );

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/field-owner/my-fields' },
    });
  });
});
