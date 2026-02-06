# Take ownership and set registry keys
$regPath = "HKLM:\SOFTWARE\Classes\CLSID\{B2B4A4D1-2754-4140-A2EB-9A76D9D7CDC6}"

Write-Host "Taking ownership of registry keys..." -ForegroundColor Cyan

# Enable privilege to take ownership
$definition = @"
using System;
using System.Runtime.InteropServices;
public class AdjPriv {
    [DllImport("advapi32.dll", ExactSpelling = true, SetLastError = true)]
    internal static extern bool AdjustTokenPrivileges(IntPtr htok, bool disall, ref TokPriv1Luid newst, int len, IntPtr prev, IntPtr relen);
    [DllImport("advapi32.dll", ExactSpelling = true, SetLastError = true)]
    internal static extern bool OpenProcessToken(IntPtr h, int acc, ref IntPtr phtok);
    [DllImport("advapi32.dll", SetLastError = true)]
    internal static extern bool LookupPrivilegeValue(string host, string name, ref long pluid);
    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    internal struct TokPriv1Luid {
        public int Count;
        public long Luid;
        public int Attr;
    }
    internal const int SE_PRIVILEGE_ENABLED = 0x00000002;
    internal const int TOKEN_QUERY = 0x00000008;
    internal const int TOKEN_ADJUST_PRIVILEGES = 0x00000020;
    public static bool EnablePrivilege(long processHandle, string privilege) {
        bool retVal;
        TokPriv1Luid tp;
        IntPtr hproc = new IntPtr(processHandle);
        IntPtr htok = IntPtr.Zero;
        retVal = OpenProcessToken(hproc, TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, ref htok);
        tp.Count = 1;
        tp.Luid = 0;
        tp.Attr = SE_PRIVILEGE_ENABLED;
        retVal = LookupPrivilegeValue(null, privilege, ref tp.Luid);
        retVal = AdjustTokenPrivileges(htok, false, ref tp, 0, IntPtr.Zero, IntPtr.Zero);
        return retVal;
    }
}
"@

Add-Type -TypeDefinition $definition -PassThru | Out-Null
[AdjPriv]::EnablePrivilege([System.Diagnostics.Process]::GetCurrentProcess().Handle, "SeTakeOwnershipPrivilege") | Out-Null
[AdjPriv]::EnablePrivilege([System.Diagnostics.Process]::GetCurrentProcess().Handle, "SeRestorePrivilege") | Out-Null

# Set registry values
try {
    Set-ItemProperty -Path $regPath -Name "(Default)" -Value "Linux" -Force -ErrorAction Stop
    Write-Host "Set main key" -ForegroundColor Green
} catch {
    Write-Host "Failed to set main key: $_" -ForegroundColor Red
}

try {
    $iconPath = "$regPath\DefaultIcon"
    if (-not (Test-Path $iconPath)) { New-Item -Path $iconPath -Force | Out-Null }
    Set-ItemProperty -Path $iconPath -Name "(Default)" -Value "C:\Windows\System32\wsl.exe,-1" -Force -ErrorAction Stop
    Write-Host "Set DefaultIcon" -ForegroundColor Green
} catch {
    Write-Host "Failed to set DefaultIcon: $_" -ForegroundColor Red
}

try {
    $serverPath = "$regPath\InProcServer32"
    if (-not (Test-Path $serverPath)) { New-Item -Path $serverPath -Force | Out-Null }
    Set-ItemProperty -Path $serverPath -Name "(Default)" -Value "C:\Windows\System32\windows.storage.dll" -Force -ErrorAction Stop
    Write-Host "Set InProcServer32" -ForegroundColor Green
} catch {
    Write-Host "Failed to set InProcServer32: $_" -ForegroundColor Red
}

Write-Host "`nDone! Verifying..." -ForegroundColor Cyan
Start-Sleep -Seconds 1
node scripts\check-registry.js
