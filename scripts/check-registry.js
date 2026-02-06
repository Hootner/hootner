import { execSync } from 'child_process';

const registryKeys = [
  {
    path: 'HKLM\\SOFTWARE\\Classes\\CLSID\\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}',
    values: ['@', 'SortOrderIndex', 'System.IsPinnedToNameSpaceTree']
  },
  {
    path: 'HKLM\\SOFTWARE\\Classes\\CLSID\\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\\DefaultIcon',
    values: ['@']
  },
  {
    path: 'HKLM\\SOFTWARE\\Classes\\CLSID\\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\\InProcServer32',
    values: ['@']
  },
  {
    path: 'HKLM\\SOFTWARE\\Classes\\CLSID\\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\\Instance',
    values: ['CLSID']
  },
  {
    path: 'HKLM\\SOFTWARE\\Classes\\CLSID\\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\\Instance\\InitPropertyBag',
    values: ['DisplayType', 'EnumObjectsTelemetryValue', 'Provider', 'ResName']
  },
  {
    path: 'HKLM\\SOFTWARE\\Classes\\CLSID\\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}\\ShellFolder',
    values: ['Attributes', 'FolderValueFlags']
  }
];

console.log('🔍 Checking Windows Registry values...\n');

let allSet = true;

registryKeys.forEach(({ path, values }) => {
  console.log(`📂 ${path}`);
  
  values.forEach(valueName => {
    try {
      const cmd = `reg query "${path}" /v ${valueName === '@' ? '/ve' : `"${valueName}"`}`;
      execSync(cmd, { stdio: 'pipe' });
      console.log(`  ✅ ${valueName === '@' ? '(Default)' : valueName}`);
    } catch {
      console.log(`  ❌ ${valueName === '@' ? '(Default)' : valueName} - NOT SET`);
      allSet = false;
    }
  });
  console.log('');
});

if (allSet) {
  console.log('✅ All registry values are set correctly!');
} else {
  console.log('❌ Some registry values are missing.');
  console.log('\n💡 To restore: Right-click config\\backup.reg → Merge');
}
