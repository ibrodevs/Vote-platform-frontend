const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://voteplatformbackend.pythonanywhere.com/api/v1';

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code = 'unknown_error', details?: any) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  // Add auth tokens
  if (typeof window !== 'undefined') {
    const studentToken = sessionStorage.getItem('student_token');
    const adminToken = localStorage.getItem('admin_token');

    if (options.headers && 'Authorization' in options.headers) {
      // already set
    } else if (endpoint.includes('/admin/')) {
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
    } else if (endpoint.includes('/auth/student/register/') || endpoint.includes('/auth/student/login/') || endpoint.includes('/auth/student/identify/') || endpoint.includes('/auth/student/verify/')) {
      // public endpoints, no token needed
    } else if (studentToken) {
      headers['Authorization'] = `Bearer ${studentToken}`;
    } else if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.method && options.method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return {} as T;
  }

  // Handle blob responses (e.g. Excel export)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('spreadsheetml') || contentType.includes('octet-stream') || contentType.includes('csv')) {
    if (!response.ok) {
      throw new ApiError('Ошибка выгрузки файла', 'export_failed');
    }
    return (await response.blob()) as unknown as T;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiError(`Ошибка сервера (${response.status})`, 'server_error');
    }
    return {} as T;
  }

  if (!response.ok) {
    const err = data.error || {};
    throw new ApiError(err.message || 'Произошла непредвиденная ошибка', err.code || 'request_failed', err.details);
  }

  return data;
}

export function getMediaUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = (process.env.NEXT_PUBLIC_API_URL || 'https://voteplatformbackend.pythonanywhere.com/api/v1').replace(/\/api\/v1\/?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export const api = {
  // Public Universities & Faculties
  getUniversities: () => request<any[]>('/universities/'),
  getUniversityInfo: (code: string) => request<any>(`/universities/${code}/info/`),
  getUniversityFaculties: (universityId: string) => request<any[]>(`/universities/${universityId}/faculties/`),

  // Student Auth
  studentRegister: (data: { full_name: string; university_id: string; faculty?: string; course: number; group: string; email: string; password: string }) =>
    request<any>('/auth/student/register/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  studentPasswordLogin: (data: { email: string; password: string }) =>
    request<any>('/auth/student/login/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getStudentProfile: () => request<any>('/auth/student/me/'),

  studentIdentify: (data: { university_code: string; student_id: string; phone_number: string }) =>
    request<any>('/auth/student/identify/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  studentVerify: (data: { request_id: string; code: string }) =>
    request<any>('/auth/student/verify/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Public & Student Voting
  getRecentElections: () => request<any[]>('/elections/recent/'),
  getAvailableElections: (all: boolean = false) => request<any[]>(`/elections/available/${all ? '?all=true' : ''}`),
  getElectionDetail: (id: string) => request<any>(`/elections/${id}/`),
  getElectionCandidates: (electionId: string) => request<any[]>(`/elections/${electionId}/candidates/`),
  getCandidateDetails: (candidateId: string) => request<any>(`/candidates/${candidateId}/`),
  castVote: (data: { election_id: string; candidate_id: string }) =>
    request<any>('/voting/cast/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getVotingStatus: (electionId: string) => request<{ has_voted: boolean; voted_at?: string }>(`/voting/status/${electionId}/`),

  // Admin Auth
  adminLogin: (credentials: { email: string; password: string }) =>
    request<any>('/auth/admin/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  adminMe: () => request<any>('/auth/admin/me/'),

  // Admin Staff & Observers Management
  getAdminUsers: (params: { university?: string; role?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.university) q.set('university', params.university);
    if (params.role) q.set('role', params.role);
    const qs = q.toString();
    return request<any[]>(`/auth/admin/users/${qs ? `?${qs}` : ''}`);
  },
  createAdminUser: (data: { email: string; password?: string; full_name: string; role: string; university_id?: string }) =>
    request<any>('/auth/admin/users/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAdminUser: (id: string, data: any) =>
    request<any>(`/auth/admin/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  deleteAdminUser: (id: string) =>
    request<any>(`/auth/admin/users/${id}/`, {
      method: 'DELETE'
    }),

  // Admin Universities & Faculties
  getAdminUniversities: () => request<any>('/admin/universities/'),
  createAdminUniversity: (data: any) =>
    request<any>('/admin/universities/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateAdminUniversity: (id: string, data: any) =>
    request<any>(`/admin/universities/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  toggleStudentRegistration: (universityId?: string, isOpen?: boolean) => {
    const url = universityId ? `/admin/universities/${universityId}/toggle-registration/` : '/admin/universities/toggle-registration/';
    const body: any = {};
    if (universityId) body.university_id = universityId;
    if (typeof isOpen === 'boolean') body.is_registration_open = isOpen;
    return request<any>(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  deleteAdminUniversity: (id: string) =>
    request<any>(`/admin/universities/${id}/`, {
      method: 'DELETE'
    }),
  createAdminFaculty: (universityId: string, data: { name: string; name_ky?: string; code?: string }) =>
    request<any>(`/admin/universities/${universityId}/faculties/`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteAdminFaculty: (universityId: string, facultyId: string) =>
    request<any>(`/admin/universities/${universityId}/faculties/${facultyId}/`, {
      method: 'DELETE'
    }),

  // Admin Students
  getAdminStudents: (universityId?: string, params: { page?: number; search?: string; faculty?: string; course?: number; onlyRegistered?: boolean; voted?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.search) q.set('search', params.search);
    if (params.faculty) q.set('faculty', params.faculty);
    if (params.course) q.set('course', String(params.course));
    if (params.onlyRegistered) q.set('only_registered', 'true');
    if (params.voted) q.set('voted', params.voted);

    if (universityId && universityId !== 'all') {
      return request<any>(`/admin/universities/${universityId}/students/?${q.toString()}`);
    }
    return request<any>(`/admin/students/?${q.toString()}`);
  },
  uploadStudents: (universityId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<any>(`/admin/universities/${universityId}/students/upload/`, {
      method: 'POST',
      body: formData
    });
  },
  getBatchStatus: (batchId: string) => request<any>(`/admin/upload-batches/${batchId}/status/`),

  // Admin Elections
  getAdminElections: (params: { status?: string; university?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.university) q.set('university', params.university);
    return request<any>(`/admin/elections/?${q.toString()}`);
  },
  createElection: (data: any) =>
    request<any>('/admin/elections/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateElection: (id: string, data: any) =>
    request<any>(`/admin/elections/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
  deleteElection: (id: string) =>
    request<any>(`/admin/elections/${id}/`, {
      method: 'DELETE'
    }),
  startElection: (id: string) =>
    request<any>(`/admin/elections/${id}/start/`, {
      method: 'POST'
    }),
  finishElection: (id: string) =>
    request<any>(`/admin/elections/${id}/finish/`, {
      method: 'POST'
    }),
  cancelElection: (id: string) =>
    request<any>(`/admin/elections/${id}/cancel/`, {
      method: 'POST'
    }),
  getElectionTurnout: (id: string) => request<any>(`/admin/elections/${id}/turnout/`),
  getElectionResults: (id: string) => request<any>(`/admin/elections/${id}/results/`),
  exportElectionResults: (id: string) =>
    request<Blob>(`/admin/elections/${id}/results/export/`, {
      method: 'POST'
    }),

  // Admin Candidates
  getAdminCandidates: (electionId: string) => request<any>(`/admin/elections/${electionId}/candidates/`),
  createCandidate: (electionId: string, data: any) =>
    request<any>(`/admin/elections/${electionId}/candidates/`, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data)
    }),
  updateCandidate: (id: string, data: any) =>
    request<any>(`/admin/candidates/${id}/`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data)
    }),
  deleteCandidate: (id: string) =>
    request<any>(`/admin/candidates/${id}/`, {
      method: 'DELETE'
    }),
  reorderCandidates: (electionId: string, orderedIds: string[]) =>
    request<any>(`/admin/elections/${electionId}/candidates/reorder/`, {
      method: 'POST',
      body: JSON.stringify({ ordered_ids: orderedIds })
    }),
};
