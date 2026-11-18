import Swal from "sweetalert2";

export function showAlert(icon, text) {
    return Swal.fire({
        icon,
        text,
        confirmButtonColor: "#315e4b",
    });
}

export function confirmAction(text) {
    return Swal.fire({
        icon: "warning",
        text,
        showCancelButton: true,
        confirmButtonText: "Continue",
        confirmButtonColor: "#a1534d",
        cancelButtonColor: "#74817a",
    });
}
