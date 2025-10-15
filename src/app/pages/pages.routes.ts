import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { AboutUs } from './aboutus/aboutus';
import { ContactUs } from './contactus/contactus';
import { Faq } from './faq/faq';
import { Help } from './help/help';
import { Invoice } from './invoice/invoice';
import { Search } from './search/search';
import { Member } from './member/member';
import { MemberClaims } from './member/claims/member-claims';
import { MemberContact } from './member/contact/member-contact';
import { MemberDiagnosis } from './member/diagnosis/member-diagnosis';
import { MemberEligibility } from './member/eligibility/member-eligibility';
import { MemberProcedure } from './member/procedure/member-procedure';
import { MemberAlternateId } from './member/alternate-id/member-alternate-id';
import { MemberPrograms } from './member/programs/member-programs';
import { Reports } from './reports/reports';
import { ReportDetail } from './reports/report-detail';

export default [
    { path: 'aboutus', data: { breadcrumb: 'About' }, component: AboutUs },
    { path: 'documentation', data: { breadcrumb: 'Documentation' }, component: Documentation },
    { path: 'contact', data: { breadcrumb: 'Contact' }, component: ContactUs },
    { path: 'crud', data: { breadcrumb: 'Crud' }, component: Crud },
    { path: 'empty', data: { breadcrumb: 'Empty' }, component: Empty },
    { path: 'faq', data: { breadcrumb: 'FAQ' }, component: Faq },
    { path: 'help', data: { breadcrumb: 'Help' }, component: Help },
    { path: 'invoice', data: { breadcrumb: 'Invoice' }, component: Invoice },
    { path: 'search', data: { breadcrumb: 'Search' }, component: Search },
    { path: 'reports', data: { breadcrumb: 'Reports' }, component: Reports },
    { path: 'reports/:id', data: { breadcrumb: 'Report Detail' }, component: ReportDetail },
    { 
        path: 'member/:id', 
        data: { breadcrumb: 'Member Details' }, 
        component: Member,
        children: [
            { path: '', component: MemberPrograms },
            { path: 'claims', data: { breadcrumb: 'Claims' }, component: MemberClaims },
            { path: 'contact', data: { breadcrumb: 'Contact Info' }, component: MemberContact },
            { path: 'diagnosis', data: { breadcrumb: 'Diagnosis' }, component: MemberDiagnosis },
            { path: 'eligibility', data: { breadcrumb: 'Eligibility' }, component: MemberEligibility },
            { path: 'procedure', data: { breadcrumb: 'Procedure' }, component: MemberProcedure },
            { path: 'alternate-id', data: { breadcrumb: 'Alternate ID' }, component: MemberAlternateId }
        ]
    },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
