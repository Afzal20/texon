const fs = require('fs')
const path = require('path')

const categories = [
  { title: "Merchandising", slug: "merchandising", pages: ["Style management","Pre-costing","Sample order management","Bulk PO management","Budget & demand assessment","Capacity & booking allocation","Buyer enquiry analysis","RM collection, consumption, sourcing","Development monitoring (by supplier)","Sample monitoring (FIT, PP)","SMV calculation","IE suggestion for PPH","Skill inventory","Production downtime analysis","Line layout","Process-wise targets & achievements","Production efficiency tracking"] },
  { title: "IE & Planning", slug: "ie-planning", pages: ["Capacity & booking allocation","Process-wise production planning","Risk assessment","PO-wise TnA (Time & Action)","Production order issue","Production dashboard","Style analysis","Ladder planning","Line planning (loading & unloading)"] },
  { title: "Commercial Management", slug: "commercial-management", pages: ["Import management","Export management","Export LC/sales contract collection & amendment","BTB LC opening & amendment","Shipment monitoring & ETA updates","Supplier document receive & acceptance","Acceptance clearance","Booking to forwarder","Invoice preparation","Bill of exchange/bank document","Realization follow-up","Short realization cause tracking","SOD/FC transfer acknowledgement","Disbursement amount tracking"] },
  { title: "Procurement, Sourcing & Supply", slug: "procurement", pages: ["Raw materials booking","Knitting & dyeing program","Raw materials requisition","Procurement management","Stock loan management","Quotation vs actual analysis","Supplier selection (price, quality, delivery, grade)"] },
  { title: "Production", slug: "production", pages: ["Production order received","Process-wise floor layout","Floor requisition","Process-wise production execution","Quality assurance","Inspection & packing","RM requisition & approval","Cutting & sending to line","Artwork/printing/embroidery monitoring","Line input","Hourly sewing production","Send to washing","Receive from washing","Thread cutting","Final QC","Carton & packing","Packing list preparation","Booking to forwarder","Inspection schedule","Ex-factory"] },
  { title: "Inventory / Store", slug: "inventory", pages: ["Fabric inventory","Accessories inventory","Trims inventory","Physical inventory with PI/booking","Shade approval & distribution","Fabric inspection","RM issue against approved requisition","Gate pass, challan prepare & printing","Leftover declarations after style/lot close","Re-booking or PO for remaining quantity","RM transfer (style/lot/store to style/lot/store)","Local purchase","Receiving/returning RM to/from supplier","Damaged/rejected goods receiving","Low-stock alerts","Opening/closing stock tracking","Wastage tracking"] },
  { title: "Quality Control", slug: "quality-control", pages: ["Fabric inspection","Inline QC","End-line QC","Finishing QC","Final inspection","Defect category tracking","Rejection report","Alteration report","Buyer-wise quality history","Corrective action tracking"] },
  { title: "HR, Attendance & Payroll", slug: "hr", pages: ["Employee profile","Worker ID","Department & designation","Shift schedule","Attendance","Overtime","Leave","Salary sheet","Bonus","Payroll approval","Compliance reports"] },
  { title: "Accounts & Finance", slug: "accounts-finance", pages: ["Accounts payable","Accounts receivable","Supplier bills","Buyer payments","Cost center tracking","Order-wise profit & loss","Bank & cash management","Expense tracking","Financial reporting","Integrated financial accounting system"] },
  { title: "CRM", slug: "crm", pages: ["Buyer profile","Buyer communication records","Order amendment history","Buyer-wise profitability"] },
  { title: "TnA (Time & Action)", slug: "tna", pages: ["Task/job/order management & monitoring","Task scheduling (front/back calculation)","SMS, email, auto-alarm notification","Export/import data in CSV/Excel","Graphic view of task/job/order status","Critical path analysis","Task splitting at any level","Task dependency specification"] },
  { title: "Control Panel / Admin", slug: "admin", pages: ["User management","Security & access control","Backup & recovery","Document archiving","Role-based permissions","Micro-level permissions (user, location, sub-company)","Buyer/marketing team-wise price level permission"] },
  { title: "Reporting & Export", slug: "reporting", pages: ["MIS reporting","Management dashboards","All reports export to Excel & PDF","Order-wise profitability","Style-wise profitability","Production efficiency reports"] },
  { title: "Multi-Company / Multi-Location", slug: "multi-company", pages: ["Group-company & multi-company","Multi-currency support","Location-based operations","Inter-modules integrated system"] },
  { title: "Subcontract Management", slug: "subcontract", pages: ["Subcontract tracking"] },
  { title: "Fixed Assets", slug: "fixed-assets", pages: ["Fixed asset management"] }
]

function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
function toComponentName(t) { return t.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('') }

const appDir = path.join(__dirname, '..', 'app')
let totalCount = 0

for (const cat of categories) {
  const catDir = path.join(appDir, cat.slug)
  fs.mkdirSync(catDir, { recursive: true })

  // Category index page
  const pageLinks = cat.pages.map(p => {
    const s = slugify(p)
    return '          <a key="' + s + '" href="' + cat.slug + '/' + s + '">' +
      '\n            <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">' +
      '\n              <CardHeader className="pb-3">' +
      '\n                <CardTitle className="text-sm font-semibold flex items-center justify-between">' +
      '\n                  ' + p.replace(/"/g, '\\"') +
      '\n                  <ArrowRight className="h-4 w-4 text-muted-foreground" />' +
      '\n                </CardTitle>' +
      '\n              </CardHeader>' +
      '\n            </Card>' +
      '\n          </a>'
  }).join('\n')

  const indexContent = '"use client"\n\n' +
    'import { AppLayout } from "@/components/layout/AppLayout"\n' +
    'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"\n' +
    'import { Badge } from "@/components/ui/badge"\n' +
    'import { ArrowRight, Construction } from "lucide-react"\n\n' +
    'const pages = [\n' +
    cat.pages.map(p => '  { title: "' + p.replace(/"/g, '\\"') + '", slug: "' + slugify(p) + '" }').join(',\n') +
    '\n]\n\n' +
    'export default function ' + toComponentName(cat.title) + 'IndexPage() {\n' +
    '  return (\n' +
    '    <AppLayout>\n' +
    '      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">\n' +
    '        <div className="flex items-center justify-between">\n' +
    '          <div>\n' +
    '            <h2 className="text-3xl font-bold tracking-tight">' + cat.title + '</h2>\n' +
    '            <p className="text-muted-foreground mt-1 text-sm">' + cat.pages.length + ' modules</p>\n' +
    '          </div>\n' +
    '          <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200 bg-amber-50">\n' +
    '            <Construction className="h-3 w-3" /> Under Development\n' +
    '          </Badge>\n' +
    '        </div>\n' +
    '        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">\n' +
    pageLinks + '\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </AppLayout>\n' +
    '  )\n' +
    '}\n'

  fs.writeFileSync(path.join(catDir, 'page.tsx'), indexContent)

  // Individual page stubs
  for (const page of cat.pages) {
    const pageSlug = slugify(page)
    const pageDir = path.join(catDir, pageSlug)
    fs.mkdirSync(pageDir, { recursive: true })

    const componentName = toComponentName(page) + 'Page'
    const pageContent = '"use client"\n\n' +
      'import { AppLayout } from "@/components/layout/AppLayout"\n' +
      'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"\n' +
      'import { Badge } from "@/components/ui/badge"\n' +
      'import { Construction, ArrowLeft } from "lucide-react"\n\n' +
      'export default function ' + componentName + '() {\n' +
      '  return (\n' +
      '    <AppLayout>\n' +
      '      <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">\n' +
      '        <div className="flex items-center justify-between">\n' +
      '          <div>\n' +
      '            <a href="' + cat.slug + '" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">\n' +
      '              <ArrowLeft className="h-3 w-3" /> ' + cat.title + '\n' +
      '            </a>\n' +
      '            <h2 className="text-3xl font-bold tracking-tight">' + page + '</h2>\n' +
      '          </div>\n' +
      '          <Badge variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200 bg-amber-50">\n' +
      '            <Construction className="h-3 w-3" /> Coming Soon\n' +
      '          </Badge>\n' +
      '        </div>\n' +
      '        <Card>\n' +
      '          <CardHeader>\n' +
      '            <CardTitle className="text-lg">Module Under Development</CardTitle>\n' +
      '          </CardHeader>\n' +
      '          <CardContent>\n' +
      '            <p className="text-sm text-muted-foreground">This module is currently being built. Check back soon for updates.</p>\n' +
      '          </CardContent>\n' +
      '        </Card>\n' +
      '      </div>\n' +
      '    </AppLayout>\n' +
      '  )\n' +
      '}\n'

    fs.writeFileSync(path.join(pageDir, 'page.tsx'), pageContent)
    totalCount++
  }
}

console.log('Generated ' + categories.length + ' category pages + ' + totalCount + ' module pages = ' + (categories.length + totalCount) + ' total')
