// FormV2 wiring for the subcontractor portal: custom field types (document slot, notice, repeat, matrix, computed)
// and the builders that turn a section from data/portal.js into a FormV2 schema + values object.
import { baseFieldProps } from '@/componentsV2/FormV2/fields/_baseFieldProps';
import DocumentSlot from '~/candidates/DocumentSlot/DocumentSlot.vue';
import InlineNotice from '~/candidates/InlineNotice/InlineNotice.vue';
import RepeatField from '~/candidates/FormTableFields/RepeatField.vue';
import MatrixField from '~/candidates/FormTableFields/MatrixField.vue';
import { currency } from '~/candidates/FormTableFields/format';
import { documents } from './data/portal';

const docById = Object.fromEntries(documents.map((d) => [d.id, d]));

/** `document` field: the DocumentSlot for `field.props.slotId`, compact, directly under the field it evidences. */
const DocumentField = {
  name: 'DocumentField',
  props: { ...baseFieldProps },
  render(h) {
    const doc = docById[this.field.props.slotId];
    return doc ? h(DocumentSlot, { props: { doc, compact: true } }) : h('span');
  },
};

/** `notice` field: an InlineNotice (declared vs document mismatch). */
const NoticeField = {
  name: 'NoticeField',
  props: { ...baseFieldProps },
  render(h) {
    return h(InlineNotice, { props: { tone: this.field.props.tone || 'warning', message: this.field.props.message } });
  },
};

/** `computed` field: a read-only derived value with its formula. */
const ComputedField = {
  name: 'ComputedField',
  props: { ...baseFieldProps },
  render(h) {
    return h('div', { class: 'flex flex-col gap-space-2 font-label' }, [
      h('span', { class: 'text-fontsize-16 leading-lineheight-24 text-text-default tabular-nums' }, this.field.props.display),
      h('span', { class: 'text-fontsize-12 leading-lineheight-16 text-text-soft' }, `= ${this.field.props.formula}`),
    ]);
  },
};

export const portalFieldTypes = { document: DocumentField, notice: NoticeField, computed: ComputedField, repeat: RepeatField, matrix: MatrixField };

// Column definitions for repeat and matrix fields, by field id.
const COLUMNS = {
  principals: [{ key: 'name', label: 'Name' }, { key: 'title', label: 'Title' }, { key: 'ownership', label: 'Ownership', format: 'percent' }],
  licenses: [{ key: 'state', label: 'State' }, { key: 'number', label: 'Number' }, { key: 'classifications', label: 'Classification' }, { key: 'expiry', label: 'Expires', format: 'date' }],
  businessLicenses: [{ key: 'jurisdiction', label: 'Jurisdiction' }, { key: 'number', label: 'Number' }, { key: 'expiry', label: 'Expires', format: 'date' }],
  branches: [{ key: 'address', label: 'Address' }],
  pastProjects: [{ key: 'name', label: 'Project' }, { key: 'city', label: 'Location' }, { key: 'owner', label: 'Owner' }, { key: 'sector', label: 'Sector' }, { key: 'value', label: 'Value', format: 'currency' }, { key: 'finish', label: 'Finished', format: 'date' }, { key: 'reference.name', label: 'Reference' }],
  specialProjects: [{ key: 'condition', label: 'Condition' }, { key: 'project', label: 'Project' }, { key: 'value', label: 'Value', format: 'currency' }, { key: 'reference', label: 'Reference' }],
  keyPersonnel: [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'years', label: 'Years' }, { key: 'certs', label: 'Certifications' }, { key: 'resume', label: 'Resume' }],
  projectRefs: [{ key: 'name', label: 'Name' }, { key: 'company', label: 'Company' }, { key: 'project', label: 'Project' }, { key: 'email', label: 'Email' }],
  supplierRefs: [{ key: 'name', label: 'Supplier' }, { key: 'contact', label: 'Contact' }, { key: 'email', label: 'Email' }],
  bankRef: [{ key: 'bank', label: 'Bank' }, { key: 'contact', label: 'Contact' }],
  diversity: [{ key: 'type', label: 'Type' }, { key: 'agency', label: 'Agency' }, { key: 'number', label: 'Number' }, { key: 'expiry', label: 'Expires', format: 'date' }],
  emr: [{ key: 'year', label: 'Year' }, { key: 'value', label: 'EMR' }],
  injury: [{ key: 'year', label: 'Year' }, { key: 'trir', label: 'TRIR' }, { key: 'dart', label: 'DART' }, { key: 'hours', label: 'Hours worked', format: 'number' }],
  revenue: [{ key: 'year', label: 'Year' }, { key: 'value', label: 'Revenue', format: 'currency' }],
  workforce: [{ key: 'role', label: 'Role' }, { key: 'count', label: 'Count' }, { key: 'avgYears', label: 'Avg years' }, { key: 'osha30', label: 'OSHA 30' }, { key: 'osha10', label: 'OSHA 10' }, { key: 'firstAid', label: 'First Aid' }, { key: 'tradeCert', label: 'Trade cert' }],
};
const ADD_LABEL = { principals: 'Add principal', licenses: 'Add license', businessLicenses: 'Add license', branches: 'Add address', pastProjects: 'Add project', specialProjects: 'Add special project', keyPersonnel: 'Add person', projectRefs: 'Add reference', supplierRefs: 'Add supplier', bankRef: 'Add bank reference', diversity: 'Add certification' };
const US_STATES = ['AZ', 'CA', 'NV', 'OR', 'WA'];
// PLACEHOLDER DATA: option lists for the multi-value fields (CSI MasterFormat divisions for trades, the GC's
// regions, the template's sectors). The selected values are merged in, so a value outside the list still shows.
const TRADES = ['03 Concrete', '05 Metals', '07 Thermal and moisture protection', '08 Openings', '09 Finishes', '21 Fire Suppression', '22 Plumbing (fire service mains)', '23 HVAC', '26 Electrical', '27 Communications', '28 Fire alarm', 'Fire alarm (28)', '31 Earthwork', '33 Utilities'];
const OPTIONS = {
  ownForces: TRADES,
  subcontracted: TRADES,
  regions: ['Northern California', 'Central Valley', 'Bay Area', 'Sacramento region', 'Central Coast', 'Southern California', 'Northern Nevada', 'Oregon'],
  sectors: ['Healthcare', 'Education', 'Multifamily', 'Industrial', 'Commercial office', 'Hospitality', 'Public works', 'Data centers', 'Life sciences'],
};
const withSelected = (list, selected) => [...list, ...(selected || []).filter((v) => !list.includes(v))].map((v) => ({ label: v, value: v }));

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const WIDE = new Set(['repeat', 'matrix', 'address', 'multiselect', 'document', 'notice']);

/** FormV2 schema for one portal section. */
export function sectionSchema(section) {
  const fields = [];
  for (const f of section.fields) {
    const base = { id: f.id, label: f.label, colSpan: WIDE.has(f.type) ? 'full' : 1 };
    const help = f.threshold ? `Requirement: ${f.threshold}` : f.detail || '';
    if (help) base.help = help;
    if (f.required && f.type !== 'computed') base.rules = [{ type: 'required' }];
    switch (f.type) {
      case 'select': {
        const opts = (f.options || (f.id === 'stateOfFormation' ? US_STATES : [])).map((o) => ({ label: o, value: slug(o) }));
        if (f.value && !opts.some((o) => o.value === slug(f.value))) opts.push({ label: String(f.value), value: slug(f.value) });
        fields.push({ ...base, type: 'select', options: opts });
        break;
      }
      case 'multiselect':
        fields.push({ ...base, type: 'multiselect', options: withSelected(OPTIONS[f.id] || [], f.value) });
        break;
      case 'yesno':
        fields.push({ ...base, type: 'radio', options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], props: { inline: true } });
        break;
      case 'number':
        fields.push({ ...base, type: 'number' });
        break;
      case 'repeat':
        // Tables are subsections: they draw their own 16px heading (props.title); the form label is left empty so
        // FieldRenderer draws none (it has no per-field labelPosition) (D-17).
        fields.push({ ...base, label: '', type: 'repeat', props: { columns: COLUMNS[f.id], minimum: f.minimum, addLabel: ADD_LABEL[f.id] || 'Add', title: f.label, required: !!f.required } });
        break;
      case 'matrix':
        fields.push({ ...base, label: '', type: 'matrix', props: { columns: COLUMNS[f.id], title: f.label, required: !!f.required } });
        break;
      case 'computed':
        fields.push({ ...base, type: 'computed', props: { display: currency(f.value), formula: f.formula } });
        break;
      default:
        fields.push({ ...base, type: 'text' });
    }
    if (f.mismatch) fields.push({ id: `${f.id}__notice`, type: 'notice', colSpan: 'full', labelPosition: 'hidden', props: { tone: 'warning', message: f.mismatch } });
    if (f.evidence) fields.push({ id: `${f.id}__doc`, type: 'document', colSpan: 'full', props: { slotId: f.evidence } });
  }
  // 24px between fields (was 16): with the table subsections' own padding this gives ~40px between blocks (D-17).
  return { sections: [{ id: section.id, layout: { columns: 2, gap: '24px' }, fields }] };
}

/** Initial values for FormV2, keyed by field id, in the shapes the field types expect. */
export function sectionValues(section) {
  const out = {};
  for (const f of section.fields) {
    switch (f.type) {
      case 'select':
        out[f.id] = f.value ? slug(f.value) : '';
        break;
      case 'yesno':
        out[f.id] = f.value === null || f.value === undefined ? null : f.value ? 'yes' : 'no';
        break;
      case 'currency':
        out[f.id] = f.value === null || f.value === undefined ? '' : currency(f.value);
        break;
      case 'number':
        out[f.id] = f.value === null || f.value === undefined ? null : f.value;
        break;
      case 'computed':
        break;
      default:
        out[f.id] = f.value === null || f.value === undefined ? '' : f.value;
    }
  }
  return out;
}
