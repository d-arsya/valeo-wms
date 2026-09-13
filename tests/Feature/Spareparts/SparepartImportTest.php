<?php

namespace Tests\Feature\Spareparts;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Sparepart;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class SparepartImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_import_spareparts(): void
    {
        $response = $this->post(route('spareparts.import'), []);
        $response->assertRedirect(route('login'));
    }

    public function test_technician_cannot_import_spareparts(): void
    {
        $technician = User::factory()->technician()->create();

        $response = $this
            ->actingAs($technician)
            ->post(route('spareparts.import'), []);

        $response->assertForbidden();
    }

    public function test_admin_can_import_and_upsert_spareparts(): void
    {
        $admin = User::factory()->admin()->create();

        // 1. Existing Sparepart in database
        $brand = Brand::factory()->create(['name' => 'OMRON']);
        $category = Category::factory()->create(['name' => 'Sensors']);
        $existing = Sparepart::factory()->create([
            'material_number' => 'A23000001',
            'part_name'       => 'Old Sensor Name',
            'brand_id'        => $brand->id,
            'category_id'     => $category->id,
            'actual_stock'    => 5,
            'safety_stock'    => 2,
            'unit'            => 'pcs',
            'resource'        => 'Local',
        ]);

        // 2. Build a test spreadsheet matching Valeo layout
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Master List');

        // Row 13 Headers
        $sheet->setCellValue('C13', 'Material Number');
        $sheet->setCellValue('D13', 'Location Rack Number');
        $sheet->setCellValue('E13', 'Part Name');
        $sheet->setCellValue('F13', 'Specification');
        $sheet->setCellValue('G13', 'Brand');
        $sheet->setCellValue('H13', 'Category');
        $sheet->setCellValue('I13', 'Safety Stock');
        $sheet->setCellValue('J13', 'WH Stock');
        $sheet->setCellValue('L13', 'Unit');
        $sheet->setCellValue('M13', 'Resource');
        $sheet->setCellValue('N13', 'Last PO Number');
        $sheet->setCellValue('O13', 'Last PO Supplier');
        $sheet->setCellValue('P13', 'GR Date');
        $sheet->setCellValue('Q13', 'Value per pcs');
        $sheet->setCellValue('S13', 'Rank');

        // Row 14: Update existing sparepart A23000001
        $sheet->setCellValue('C14', 'A23000001');
        $sheet->setCellValue('D14', 'A1.1');
        $sheet->setCellValue('E14', 'Updated Proximity Sensor');
        $sheet->setCellValue('F14', 'PNP 24V M12');
        $sheet->setCellValue('G14', 'OMRON');
        $sheet->setCellValue('H14', 'Sensors');
        $sheet->setCellValue('I14', 10);
        $sheet->setCellValue('J14', 45);
        $sheet->setCellValue('L14', 'box');
        $sheet->setCellValue('M14', 'Import');
        $sheet->setCellValue('N14', 'PO-9988');
        $sheet->setCellValue('O14', 'PT Global Tech');
        $sheet->setCellValue('P14', '15/08/2026');
        $sheet->setCellValue('Q14', 250000);
        $sheet->setCellValue('S14', 'A');

        // Row 15: Create brand new sparepart A23000002
        $sheet->setCellValue('C15', 'A23000002');
        $sheet->setCellValue('D15', 'B2.3');
        $sheet->setCellValue('E15', 'Cylinder Valve Pneumatic');
        $sheet->setCellValue('F15', 'Double Acting 50mm');
        $sheet->setCellValue('G15', 'SMC');
        $sheet->setCellValue('H15', 'Pneumatics');
        $sheet->setCellValue('I15', 5);
        $sheet->setCellValue('J15', 20);
        $sheet->setCellValue('L15', 'set');
        $sheet->setCellValue('M15', 'Local');
        $sheet->setCellValue('N15', 'PO-7711');
        $sheet->setCellValue('O15', 'PT Pneumatic Prima');
        $sheet->setCellValue('P15', '20/08/2026');
        $sheet->setCellValue('Q15', 750000);
        $sheet->setCellValue('S15', 'B');

        $tempPath = tempnam(sys_get_temp_dir(), 'test_import_') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        $file = new UploadedFile(
            $tempPath,
            'MasterList_Test.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this
            ->actingAs($admin)
            ->post(route('spareparts.import'), [
                'file' => $file,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // 3. Verify Database Updates (Upsert)
        $this->assertDatabaseHas('spareparts', [
            'material_number' => 'A23000001',
            'part_name'       => 'Updated Proximity Sensor',
            'safety_stock'    => 10,
            'actual_stock'    => 45,
            'unit'            => 'box',
            'resource'        => 'Import',
            'rank'            => 'A',
            'price_per_unit'  => '250000.00',
        ]);

        // Verify Database Insert
        $this->assertDatabaseHas('spareparts', [
            'material_number' => 'A23000002',
            'part_name'       => 'Cylinder Valve Pneumatic',
            'safety_stock'    => 5,
            'actual_stock'    => 20,
            'unit'            => 'set',
            'resource'        => 'Local',
            'rank'            => 'B',
            'price_per_unit'  => '750000.00',
        ]);

        // Verify Auto-created Brand SMC and Category Pneumatics
        $this->assertDatabaseHas('brands', ['name' => 'SMC']);
        $this->assertDatabaseHas('categories', ['name' => 'Pneumatics']);

        @unlink($tempPath);
    }

    public function test_cannot_import_arbitrary_document_with_wrong_headers(): void
    {
        $admin = User::factory()->admin()->create();

        // Build arbitrary unrelated spreadsheet (e.g. employee / finance sheet)
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Laporan Gaji');
        $sheet->setCellValue('A1', 'Nama Karyawan');
        $sheet->setCellValue('B1', 'Departemen');
        $sheet->setCellValue('C1', 'Nominal Gaji');
        $sheet->setCellValue('A2', 'Budi Santoso');
        $sheet->setCellValue('B2', 'Keuangan');
        $sheet->setCellValue('C2', 5000000);

        $tempPath = tempnam(sys_get_temp_dir(), 'test_invalid_') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        $file = new UploadedFile(
            $tempPath,
            'Laporan_Gaji.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this
            ->actingAs($admin)
            ->from(route('spareparts.index'))
            ->post(route('spareparts.import'), [
                'file' => $file,
            ]);

        $response->assertSessionHasErrors('import');
        $this->assertDatabaseCount('spareparts', 0);

        @unlink($tempPath);
    }

    public function test_import_resolves_rack_and_bin_from_location_format(): void
    {
        $admin = User::factory()->admin()->create();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Master List');

        // Headers
        $sheet->setCellValue('C13', 'Material Number');
        $sheet->setCellValue('D13', 'Location Rack Number');
        $sheet->setCellValue('E13', 'Part Name');
        $sheet->setCellValue('I13', 'Safety Stock');
        $sheet->setCellValue('J13', 'WH Stock');

        // Row 14: format "A/A21" -> Rack "A", Bin "A21"
        $sheet->setCellValue('C14', 'LOC001');
        $sheet->setCellValue('D14', 'A/A21');
        $sheet->setCellValue('E14', 'Test Part 1');
        $sheet->setCellValue('I14', 1);
        $sheet->setCellValue('J14', 5);

        // Row 15: format "B1.2" -> Rack "B", Bin "B1.2"
        $sheet->setCellValue('C15', 'LOC002');
        $sheet->setCellValue('D15', 'B1.2');
        $sheet->setCellValue('E15', 'Test Part 2');
        $sheet->setCellValue('I15', 2);
        $sheet->setCellValue('J15', 10);

        $tempPath = tempnam(sys_get_temp_dir(), 'test_loc_') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        $file = new UploadedFile(
            $tempPath,
            'MasterList_Loc.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        $response = $this
            ->actingAs($admin)
            ->post(route('spareparts.import'), [
                'file' => $file,
            ]);

        $response->assertSessionHasNoErrors();

        // Check Rack A and Bin A21
        $this->assertDatabaseHas('racks', ['code' => 'A']);
        $this->assertDatabaseHas('bins', ['code' => 'A21']);

        // Check Rack B and Bin B1.2
        $this->assertDatabaseHas('racks', ['code' => 'B']);
        $this->assertDatabaseHas('bins', ['code' => 'B1.2']);

        $sp1 = Sparepart::where('material_number', 'LOC001')->with('bin.rack')->first();
        $this->assertNotNull($sp1);
        $this->assertEquals('A21', $sp1->bin->code);
        $this->assertEquals('A', $sp1->bin->rack->code);

        $sp2 = Sparepart::where('material_number', 'LOC002')->with('bin.rack')->first();
        $this->assertNotNull($sp2);
        $this->assertEquals('B1.2', $sp2->bin->code);
        $this->assertEquals('B', $sp2->bin->rack->code);

        @unlink($tempPath);
    }

    public function test_identical_price_and_data_are_treated_as_unchanged(): void
    {
        $admin = User::factory()->admin()->create();

        $brand = Brand::factory()->create(['name' => 'OMRON']);
        $category = Category::factory()->create(['name' => 'Sensors']);
        $rack = \App\Models\Rack::firstOrCreate(['code' => 'GEN']);
        $bin = \App\Models\Bin::firstOrCreate(['code' => 'LOC-STOCKROOM', 'rack_id' => $rack->id]);

        Sparepart::factory()->create([
            'material_number' => 'A23000143',
            'part_name'       => 'Push Button',
            'specification'   => 'K22-21R',
            'brand_id'        => $brand->id,
            'category_id'     => $category->id,
            'bin_id'          => $bin->id,
            'safety_stock'    => 2,
            'actual_stock'    => 0,
            'price_per_unit'  => 42000,
            'rank'            => 'C',
            'unit'            => 'Ea',
            'resource'        => 'Part Project',
            'last_po_number'  => '-',
            'last_supplier'   => '-',
            'last_gr_date'    => null,
        ]);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Master List');

        // Row 13 Headers
        $sheet->setCellValue('C13', 'Material Number');
        $sheet->setCellValue('D13', 'Location Rack Number');
        $sheet->setCellValue('E13', 'Part Name');
        $sheet->setCellValue('F13', 'Specification');
        $sheet->setCellValue('G13', 'Brand');
        $sheet->setCellValue('H13', 'Category');
        $sheet->setCellValue('I13', 'Safety Stock');
        $sheet->setCellValue('J13', 'WH Stock');
        $sheet->setCellValue('L13', 'Unit');
        $sheet->setCellValue('M13', 'Resource');
        $sheet->setCellValue('N13', 'Last PO Number');
        $sheet->setCellValue('O13', 'Last PO Supplier');
        $sheet->setCellValue('Q13', 'Value per pcs');
        $sheet->setCellValue('S13', 'Rank');

        // Row 14: Same exact data including price 42000
        $sheet->setCellValue('C14', 'A23000143');
        $sheet->setCellValue('D14', 'LOC-STOCKROOM');
        $sheet->setCellValue('E14', 'Push Button');
        $sheet->setCellValue('F14', 'K22-21R');
        $sheet->setCellValue('G14', 'OMRON');
        $sheet->setCellValue('H14', 'Sensors');
        $sheet->setCellValue('I14', 2);
        $sheet->setCellValue('J14', 0);
        $sheet->setCellValue('L14', 'Ea');
        $sheet->setCellValue('M14', 'Part Project');
        $sheet->setCellValue('N14', '-');
        $sheet->setCellValue('O14', '-');
        $sheet->setCellValue('Q14', 42000);
        $sheet->setCellValue('S14', 'C');

        $tempPath = tempnam(sys_get_temp_dir(), 'test_identical_') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        $file = new UploadedFile(
            $tempPath,
            'MasterList_Same.xlsx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            null,
            true
        );

        // Dry run request
        $response = $this
            ->actingAs($admin)
            ->postJson(route('spareparts.import'), [
                'file'    => $file,
                'dry_run' => true,
            ]);

        $response->assertOk();
        $response->assertJsonPath('preview.created', 0);
        $response->assertJsonPath('preview.updated', 0);
        $response->assertJsonPath('preview.unchanged', 1);
        $response->assertJsonCount(0, 'preview.updated_items');

        @unlink($tempPath);
    }
}
