use windows::Win32::System::Diagnostics::Debug::*;
use windows::Win32::System::Threading::*;
use windows::core::*;

fn main() -> Result<()> {
    let mut si: STARTUPINFOW = unsafe { std::mem::zeroed() };
    si.cb = std::mem::size_of::<STARTUPINFOW>() as u32;
    let mut pi: PROCESS_INFORMATION = unsafe { std::mem::zeroed() };
    
    unsafe {
        CreateProcessW(
            None,
            w!("target.exe"),
            None, None, false,
            DEBUG_ONLY_THIS_PROCESS,
            None, None,
            &si, &mut pi
        )?;
    }
    
    loop {
        let mut event: DEBUG_EVENT = unsafe { std::mem::zeroed() };
        unsafe { WaitForDebugEvent(&mut event, u32::MAX); }
        
        match event.dwDebugEventCode {
            EXCEPTION_DEBUG_EVENT => println!("Exception"),
            CREATE_PROCESS_DEBUG_EVENT => println!("Process created"),
            EXIT_PROCESS_DEBUG_EVENT => { println!("Process exited"); break; }
            _ => {}
        }
        
        unsafe {
            ContinueDebugEvent(event.dwProcessId, event.dwThreadId, DBG_CONTINUE);
        }
    }
    
    Ok(())
}
